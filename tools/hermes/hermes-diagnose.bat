@echo off
setlocal enabledelayedexpansion
title Hermes diagnostics - S.U.A.S. Veteran Crisis QRF

REM ---------------------------------------------------------------
REM  Hermes diagnostics - READ ONLY. This script changes nothing.
REM  It writes a report to your Desktop: hermes-report.txt
REM
REM  Why a .bat and not a .ps1: the whole problem is that PowerShell
REM  will not start, so the diagnostic cannot depend on PowerShell.
REM ---------------------------------------------------------------

set "REPORT=%USERPROFILE%\Desktop\hermes-report.txt"
set "PSOUT=%TEMP%\hermes-ps-test.txt"
set "NETKEY=HKLM\SOFTWARE\Microsoft\.NETFramework\v4.0.30319"
set "NETKEY32=HKLM\SOFTWARE\WOW6432Node\Microsoft\.NETFramework\v4.0.30319"
set "CFG64=%SystemRoot%\Microsoft.NET\Framework64\v4.0.30319\Config"
set "CFG32=%SystemRoot%\Microsoft.NET\Framework\v4.0.30319\Config"

echo.
echo  Hermes diagnostics - reading only, changing nothing.
echo  Writing report to: %REPORT%
echo.

> "%REPORT%" echo Hermes diagnostic report
>>"%REPORT%" echo Generated: %DATE% %TIME%
>>"%REPORT%" echo Computer: %COMPUTERNAME%
>>"%REPORT%" echo.

REM ---------- 1. Can PowerShell start at all? ----------
echo [1/5] Testing whether PowerShell can start...
>>"%REPORT%" echo ===== 1. PowerShell startup test =====
powershell.exe -NoProfile -NonInteractive -Command "exit 0" > "%PSOUT%" 2>&1
set "PSCODE=%ERRORLEVEL%"
>>"%REPORT%" echo Exit code: %PSCODE%
>>"%REPORT%" echo Output:
type "%PSOUT%" >>"%REPORT%" 2>nul
>>"%REPORT%" echo.

if "%PSCODE%"=="0" (
  echo       PowerShell starts fine.
  >>"%REPORT%" echo RESULT: PowerShell starts normally. The Hermes failure is NOT the
  >>"%REPORT%" echo         PowerShell problem described in RUNBOOK section 8.
  set "PSBROKEN=0"
) else (
  echo       PowerShell FAILED to start. This is the root cause.
  >>"%REPORT%" echo RESULT: PowerShell cannot start. This is why Hermes cannot persist
  >>"%REPORT%" echo         backend ownership and aborts its boot.
  set "PSBROKEN=1"
)

REM ---------- 2. machine.config sanity ----------
echo [2/5] Checking .NET machine.config files...
>>"%REPORT%" echo ===== 2. machine.config sanity =====
call :checkcfg "%CFG64%\machine.config" 64-bit
call :checkcfg "%CFG32%\machine.config" 32-bit
>>"%REPORT%" echo.

REM ---------- 2b. stray powershell.exe.config ----------
>>"%REPORT%" echo ===== 2b. powershell.exe.config =====
>>"%REPORT%" echo Windows does not ship this file. If it exists, another tool added
>>"%REPORT%" echo it, and a malformed one breaks PowerShell startup.
call :checkpscfg "%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe.config" 64-bit
call :checkpscfg "%SystemRoot%\SysWOW64\WindowsPowerShell\v1.0\powershell.exe.config" 32-bit
>>"%REPORT%" echo.

REM ---------- 3. .NET TLS registry values ----------
echo [3/5] Checking .NET TLS registry values...
>>"%REPORT%" echo ===== 3. .NET Framework TLS registry values =====
>>"%REPORT%" echo --- %NETKEY%
reg query "%NETKEY%" /v SchUseStrongCrypto      >>"%REPORT%" 2>&1
reg query "%NETKEY%" /v SystemDefaultTlsVersions >>"%REPORT%" 2>&1
>>"%REPORT%" echo --- %NETKEY32%
reg query "%NETKEY32%" /v SchUseStrongCrypto      >>"%REPORT%" 2>&1
reg query "%NETKEY32%" /v SystemDefaultTlsVersions >>"%REPORT%" 2>&1
>>"%REPORT%" echo.
>>"%REPORT%" echo NOTE: both values should be type REG_DWORD. If either shows REG_SZ
>>"%REPORT%" echo       or another type, that alone can break PowerShell startup.
>>"%REPORT%" echo.

REM ---------- 4. Installed .NET Framework release ----------
echo [4/5] Checking installed .NET Framework version...
>>"%REPORT%" echo ===== 4. .NET Framework install =====
reg query "HKLM\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full" /v Release >>"%REPORT%" 2>&1
reg query "HKLM\SOFTWARE\Microsoft\NET Framework Setup\NDP\v4\Full" /v Version >>"%REPORT%" 2>&1
>>"%REPORT%" echo.

REM ---------- 5. Hermes install + proxy environment ----------
echo [5/5] Checking Hermes install and proxy settings...
>>"%REPORT%" echo ===== 5. Hermes install =====
if exist "%LOCALAPPDATA%\hermes\hermes-agent" (
  >>"%REPORT%" echo Found: %LOCALAPPDATA%\hermes\hermes-agent
  if exist "%LOCALAPPDATA%\hermes\hermes-agent\venv" (
    >>"%REPORT%" echo Found: backend venv
  ) else (
    >>"%REPORT%" echo MISSING: backend venv
  )
) else (
  >>"%REPORT%" echo NOT FOUND at %LOCALAPPDATA%\hermes\hermes-agent
)
>>"%REPORT%" echo.
>>"%REPORT%" echo ===== 5b. Proxy environment =====
>>"%REPORT%" echo HTTP_PROXY=%HTTP_PROXY%
>>"%REPORT%" echo HTTPS_PROXY=%HTTPS_PROXY%
>>"%REPORT%" echo NODE_EXTRA_CA_CERTS=%NODE_EXTRA_CA_CERTS%
>>"%REPORT%" echo.
>>"%REPORT%" echo (A VPN, antivirus, or corporate proxy tool that rewrites .NET settings
>>"%REPORT%" echo  is the usual reason this breaks more than once.)

del "%PSOUT%" >nul 2>&1

echo.
echo  ---------------------------------------------------------------
echo   Done. Report saved to your Desktop as hermes-report.txt
if "%PSBROKEN%"=="1" (
  echo.
  echo   DIAGNOSIS: PowerShell cannot start. Hermes is a victim of that,
  echo   not the cause. Run hermes-fix.bat as Administrator to repair it.
) else (
  echo.
  echo   PowerShell is healthy, so this is a different Hermes problem.
  echo   Send the report to Claude and it will pick it up from there.
)
echo  ---------------------------------------------------------------
echo.
pause
exit /b 0

REM ---------- helper: look for a stray powershell.exe.config ----------
:checkpscfg
if exist "%~1" (
  for %%A in ("%~1") do >>"%REPORT%" echo %~2: PRESENT - %%~zA bytes, modified %%~tA  ^(SUSPECT^)
) else (
  >>"%REPORT%" echo %~2: not present ^(normal^)
)
goto :eof

REM ---------- helper: sanity-check one machine.config ----------
:checkcfg
set "CFGFILE=%~1"
set "CFGLABEL=%~2"
>>"%REPORT%" echo --- %CFGLABEL%: %CFGFILE%
if not exist "%CFGFILE%" (
  >>"%REPORT%" echo STATUS: MISSING - this by itself will break PowerShell.
  goto :eof
)
for %%A in ("%CFGFILE%") do >>"%REPORT%" echo Size: %%~zA bytes    Modified: %%~tA
findstr /c:"</configuration>" "%CFGFILE%" >nul 2>&1
if errorlevel 1 (
  >>"%REPORT%" echo STATUS: SUSPECT - closing configuration tag not found. Likely truncated
  >>"%REPORT%" echo         or corrupt. This is the most common cause of this failure.
) else (
  >>"%REPORT%" echo STATUS: closing tag present ^(file is probably intact^)
)
if exist "%CFGFILE%.default" (
  for %%A in ("%CFGFILE%.default") do >>"%REPORT%" echo Clean default available: %%~zA bytes
) else (
  >>"%REPORT%" echo Clean default NOT available next to this file.
)
goto :eof
