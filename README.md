# CRM Input Constructor

This repository contains a node.js command line interface (CLI) application that helps operationalize [NJEDA](https://njeda.com) grant and loan programs. The program helps generate data in EDA's CRM system and create inputs to some of EDA's Power Automate flows. This code base is probably not that useful outside the context of EDA's infrastructure.

This takes some developer expertise to execute.

*NOTE: this has not been tested on Windows systems.*

## Usage
1. Install [node.js](https://nodejs.org/) on your system.
2. Clone this repository: `git clone https://github.com/newjersey/crm-input-constructor.git`
3. Switch to the working directory: `cd crm-input-constructor`
4. Install the required node modules: `npm install`
5. Execute the desired script, e.g. `npm run grants-2`

## Scripts

### grants-2

This was used for the second COVID-19 grant program.

This is a good starting point for reuse of this codebase. This script is implemented in TypeScript and the code is much better organized than the older scripts.

Run this script with no options for help text:

`npm run grants-2`

Run this script with options to produce a result:

`npm run grants-2 -- -n 1 -dtp -b /my/base/path/`

This will throw an error, because the program can't find the needed input files. Create this folder structure, add the appropriate files in each folder, and update the paths in [grants-2/index.ts](grants-2/index.ts) as necessary -- it's probably easiest to start with a zip of an existing such folder structure, which is not included in this repository for obvious privacy reasons:

* `/my/base/path/`
  * `/my/base/path/Raw from Cognito/`
  * `/my/base/path/Taxation/`
  * `/my/base/path/WR30/`
  * `/my/base/path/DOL Lists/`
  * `/my/base/path/SAMS/`
  * `/my/base/path/Grant Phase 1/`
  * `/my/base/path/Policy Map/`
  * `/my/base/path/Non-Declined Loans/`

Now run the above command again; it should print a JSON object representing 1 application. This is usseful for debugging, especially with the `dtp` options.

To run the script in for production use, include the `-o` flag:

`npm run grants-2 -- -n 10 -dtp -b /my/base/path/ -o`

This will result in the generation of three files in a `Output` folder within your base bath:

* `/my/base/path/Output/TEST-10-skipping-0-10-OUTPUTS.json`
  * gets fed to a Power Automate flow that creates an OLADatas object in CRM, which then causes an integration to generate many records
* `/my/base/path/Output/TEST-10-skipping-0-10-INPUTS.json`
  * gets fed to a Power Automate flow that uploads each object in the JSON to its corresponding records in CRM
  * this acts as an audit trail; all raw data that went into generating the OUTPUTS file is preserved herein the INPUTS file
* `/my/base/path/Output/TEST-10-skipping-0-1-DECLINES.json`
  * gets fed to a Power Automate flow that sends declinations to applicants

### grants

This was used for the first COVID-19 grant program.

*It is not recommended to use or replicate this script.*

### grant-declines

This was used for the first COVID-19 grant program.

*It is not recommended to use or replicate this script.*

### loans

This was used for the first COVID-19 loan program.

*It is not recommended to use or replicate this script.*
