@echo off
setlocal enabledelayedexpansion
title Hermes repair - S.U.A.S. Veteran Crisis QRF

REM ---------------------------------------------------------------
REM  Hermes repair.
REM
REM  Fixes the Windows PowerShell / .NET failure that stops Hermes
REM  from starting:
REM      "Could not persist ownership for the Hermes backend"
REM      "The type initializer for 'System.Net.ServicePointManager'
REM       threw an exception."
REM
REM  Order of operations - least invasive first, retesting between
REM  each step, and it STOPS as soon as PowerShell works again:
REM      Step A: repair malformed .NET TLS registry values
REM      Step B: set aside a non-standard powershell.exe.config
REM      Step C: restore machine.config from the clean default
REM              (only with typed confirmation, always after backup)
REM
REM  Everything replaced is backed up to your Desktop first.
REM  Must be run as Administrator.
REM ---------------------------------------------------------------

set "PSOUT=%TEMP%\hermes-ps-test.txt"
set "TMPQ=%TEMP%\hermes-reg-query.txt"
set "NETKEY=HKLM\SOFTWARE\Microsoft\.NETFramework\v4.0.30319"
set "NETKEY32=HKLM\SOFTWARE\WOW6432Node\Microsoft\.NETFramework\v4.0.30319"
set "CFG64=%SystemRoot%\Microsoft.NET\Framework64\v4.0.30319\Config\machine.config"
set "CFG32=%SystemRoot%\Microsoft.NET\Framework\v4.0.30319\Config\machine.config"
set "BACKUP=%USERPROFILE%\Desktop\hermes-fix-backup-%RANDOM%"

echo.
echo  ===============================================================
echo   Hermes repair
echo  ===============================================================
echo.

REM ---------- must be Administrator ----------
fltmc >nul 2>&1
if errorlevel 1 (
  echo  STOP: this script needs Administrator rights.
  echo.
  echo  Close this window, then right-click hermes-fix.bat and choose
  echo  "Run as administrator".
  echo.
  pause
  exit /b 1
)
echo  Running as Administrator. Good.
echo.

REM ---------- is PowerShell actually broken? ----------
echo  Checking whether PowerShell can start...
call :testps
if "%PSCODE%"=="0" (
  echo.
  echo  PowerShell already starts fine, so this repair is not needed
  echo  and nothing has been changed.
  echo.
  echo  If Hermes still will not boot, run hermes-diagnose.bat and
  echo  send the Desktop report to Claude.
  echo.
  pause
  exit /b 0
)
echo  Confirmed: PowerShell cannot start. Proceeding.
echo.

mkdir "%BACKUP%" >nul 2>&1
echo  Backups for this run: %BACKUP%
echo.

REM ===============================================================
REM  STEP A - repair malformed .NET TLS registry values
REM ===============================================================
echo  ---------------------------------------------------------------
echo   Step A: checking .NET TLS registry values
echo  ---------------------------------------------------------------

reg export "%NETKEY%"   "%BACKUP%\NETFramework-v4.reg"       /y >nul 2>&1
reg export "%NETKEY32%" "%BACKUP%\NETFramework-v4-wow64.reg" /y >nul 2>&1

set "FIXEDREG=0"
call :fixval "%NETKEY%"   SchUseStrongCrypto
call :fixval "%NETKEY%"   SystemDefaultTlsVersions
call :fixval "%NETKEY32%" SchUseStrongCrypto
call :fixval "%NETKEY32%" SystemDefaultTlsVersions

if "%FIXEDREG%"=="0" (
  echo   No malformed registry values found.
) else (
  echo.
  echo   Repaired malformed value^(s^). Retesting PowerShell...
  call :testps
  if "!PSCODE!"=="0" (
    echo.
    echo   FIXED. PowerShell starts again - that was the problem.
    goto :success
  )
  echo   Still failing. Moving on to Step B.
)
echo.

REM ===============================================================
REM  STEP B - set aside a non-standard powershell.exe.config
REM ===============================================================
echo  ---------------------------------------------------------------
echo   Step B: checking for a non-standard powershell.exe.config
echo  ---------------------------------------------------------------

set "MOVEDCFG=0"
call :stashpsconfig "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe.config" 64-bit
call :stashpsconfig "%SystemRoot%\SysWOW64\WindowsPowerShell\v1.0\powershell.exe.config" 32-bit

if "%MOVEDCFG%"=="0" (
  echo   None found. Nothing to do here.
) else (
  echo.
  echo   Set aside. Retesting PowerShell...
  call :testps
  if "!PSCODE!"=="0" (
    echo.
    echo   FIXED. PowerShell starts again - that file was the problem.
    goto :success
  )
  echo   Still failing. Putting those files back and moving on to Step C.
  call :unstashpsconfig "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe.config" 64-bit
  call :unstashpsconfig "%SystemRoot%\SysWOW64\WindowsPowerShell\v1.0\powershell.exe.config" 32-bit
)
echo.

REM ===============================================================
REM  STEP C - restore machine.config from the clean default
REM ===============================================================
echo  ---------------------------------------------------------------
echo   Step C: restore machine.config from Windows' clean default
echo  ---------------------------------------------------------------
echo.
echo   This replaces the .NET machine.config files with the untouched
echo   defaults that ship with Windows. Your current files are copied
echo   to the backup folder above first, so this is reversible.
echo.
echo   Safe on a personal machine. Only skip this if you knowingly run
echo   custom ASP.NET or IIS settings on this computer.
echo.
set "GO="
set /p "GO=  Type YES and press Enter to continue (anything else quits): "
if /i not "%GO%"=="YES" (
  echo.
  echo   Cancelled. Nothing in Step C was changed.
  echo   Registry backups are still in: %BACKUP%
  echo.
  pause
  exit /b 1
)
echo.

call :restorecfg "%CFG64%" 64-bit
call :restorecfg "%CFG32%" 32-bit

echo.
echo   Retesting PowerShell...
call :testps
if "%PSCODE%"=="0" goto :success

REM ===============================================================
REM  Still broken - hand off with clear next steps
REM ===============================================================
echo.
echo  ---------------------------------------------------------------
echo   Still failing after all three repairs.
echo  ---------------------------------------------------------------
echo.
echo   That means Windows itself is damaged more deeply. Next steps,
echo   in this order, from an Administrator Command Prompt:
echo.
echo     1.  sfc /scannow
echo     2.  DISM /Online /Cleanup-Image /RestoreHealth
echo     3.  Reboot, then run this script again.
echo     4.  If it still fails, reinstall .NET Framework 4.8 from
echo         Microsoft, reboot, and run this script again.
echo.
echo   Backups from this run: %BACKUP%
echo   Run hermes-diagnose.bat and send the report to Claude.
echo.
pause
exit /b 1

:success
echo.
echo  ===============================================================
echo   SUCCESS - PowerShell starts again.
echo  ===============================================================
echo.
echo   Now start Hermes. It should boot past
echo   "Could not persist ownership for the Hermes backend".
echo.
echo   Backups from this run: %BACKUP%
echo   (You can delete that folder once Hermes has run fine for a day.)
echo.
pause
exit /b 0

REM ---------------- helpers ----------------

:testps
powershell.exe -NoProfile -NonInteractive -Command "exit 0" > "%PSOUT%" 2>&1
set "PSCODE=%ERRORLEVEL%"
goto :eof

REM  :fixval  <registry key>  <value name>
REM  Only acts when the value EXISTS but is not REG_DWORD. A missing
REM  value is normal and is left alone.
:fixval
set "K=%~1"
set "V=%~2"
reg query "%K%" /v %V% > "%TMPQ%" 2>&1
if errorlevel 1 goto :eof
findstr /c:"REG_DWORD" "%TMPQ%" >nul 2>&1
if not errorlevel 1 (
  echo   OK: %V% is REG_DWORD.
  goto :eof
)
echo   BAD: %V% has the wrong type. Rewriting it as REG_DWORD 1.
reg delete "%K%" /v %V% /f >nul 2>&1
reg add "%K%" /v %V% /t REG_DWORD /d 1 /f >nul 2>&1
set "FIXEDREG=1"
goto :eof

REM  :stashpsconfig  <powershell.exe.config path>  <label>
REM  Windows does not ship a powershell.exe.config. If one exists, some
REM  other tool added it, and a malformed one breaks PowerShell startup
REM  in exactly this way. Move it aside rather than deleting it.
:stashpsconfig
set "F=%~1"
set "L=%~2"
if not exist "%F%" goto :eof
echo   Found a non-standard config ^(%L%^).
copy /y "%F%" "%BACKUP%\powershell.exe.config.%L%.bak" >nul 2>&1
move /y "%F%" "%F%.hermes-disabled" >nul 2>&1
if errorlevel 1 (
  echo   %L%: could not move it aside.
) else (
  echo   %L%: moved aside.
  set "MOVEDCFG=1"
)
goto :eof

REM  :unstashpsconfig  <powershell.exe.config path>  <label>
:unstashpsconfig
set "F=%~1"
set "L=%~2"
if not exist "%F%.hermes-disabled" goto :eof
move /y "%F%.hermes-disabled" "%F%" >nul 2>&1
if not errorlevel 1 echo   %L%: original config put back.
goto :eof

REM  :restorecfg  <machine.config path>  <label>
:restorecfg
set "F=%~1"
set "L=%~2"
if not exist "%F%.default" (
  echo   %L%: no clean default found next to machine.config - skipped.
  goto :eof
)
if exist "%F%" (
  copy /y "%F%" "%BACKUP%\machine.config.%L%.bak" >nul 2>&1
  echo   %L%: current file backed up.
)
copy /y "%F%.default" "%F%" >nul 2>&1
if errorlevel 1 (
  echo   %L%: RESTORE FAILED - could not write the file.
) else (
  echo   %L%: restored from clean default.
)
goto :eof
