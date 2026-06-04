# Your SUAS Autonomous Agent — How to Use It

You asked for an agent that handles SUAS tech for you so you don't have to. Here it is. It lives on the internet, not on your computer. You don't install anything.

## How you talk to it

1. Go to **https://github.com/S-U-A-S-Veteran-Crisis-QRF/help/issues**
2. Click **New issue**
3. Write what you want in plain English, and start it with **`@claude`**

That's the whole interface. Example:

> `@claude` add a page listing our upcoming BBQ events with dates and locations

The agent reads it, does the work, and opens a pull request with the change. You review and click merge — or ask me (here in Claude Code on the web) to merge it for you.

## What it can do

- Edit and add pages to the website
- Fix bugs and broken links
- Write and update documents
- Answer questions about the repo
- Anything else that lives in this repository

## What it deliberately cannot do

This is on purpose, to keep SUAS and the veterans you serve safe:

- It cannot touch your personal computer
- It cannot read or send your email
- It cannot get into Google Workspace, Drive, or donor records
- It cannot spend money or post publicly
- It can only work inside this one repository

That boundary is the difference between a helpful assistant and a security risk. For a veteran-crisis nonprofit, we keep the boundary.

## Turning it on (one time)

The agent is asleep until someone with owner access does these two steps:

1. **Get a Claude API key** at https://console.anthropic.com
2. **Add it as a secret**: repo **Settings → Secrets and variables → Actions → New repository secret**
   - Name: `ANTHROPIC_API_KEY`
   - Value: paste your key

A Claude API account is pay-as-you-go and usually costs a few dollars a month for light use like this. It is separate from any Claude subscription.

## If you'd rather not deal with the API key

You already have a working agent without any of that: **right here**, Claude Code on the web. Come to this same place anytime, type what you need, and it handles the repo. The GitHub agent above is just a bonus that lets you trigger work by opening an issue instead.

## Crisis Line

If a veteran is in crisis: **Veterans Crisis Line — dial 988, then press 1.**
