# `openshift-authenticator`

Authenticator object is used when Eclipse Che requires an user to log in.
Every authenticator objects has access to Selenium WebDriver.
This package supports only Eclipse Che instances
installed from [OperatorHub](https://operatorhub.io/).

## Usage

Install via npm

`npm install @theia-extension-tester/openshift-authenticator`

Install via yarn

`yarn add @theia-extension-tester/openshift-authenticator`

Create new instance of OpenShift authenticator object.

``` js
import { OpenShiftAuthenticator } from "@theia-extension-tester/openshift-authenticator";

const auth = new OpenShiftAuthenticator({
    // Form data array in format (input name, input value).
    inputData: [
        {
            // Input field name. Leave unchanged.
            name: "username",
            // Eclipse Che user name.
            //Recommended to store in .env file.
            value: process.env.CHE_USERNAME
        },
        {
            // Input field name. Leave unchanged.
            name: "password",
            // Eclipse Che user password.
            // Recommended to store in .env file.
            value: process.env.CHE_PASSWORD
        },
        // ... and other values if needed
    ],
    // Depends if form is split into multiple forms.
    // Leave false if single form is used. 
    multiStepForm: false,
    // Login method button text.
    // Might have multiple variants (e.g. my_htpasswd_provider)
    loginMethod: "DevSandbox"
});
```

After that it is possible to start authentication process.

```ts
await auth.authenticate();
```

## Starter package configuration

Configuration changes based on which login method is used and what
input fields must be filled in to. If `theiatest` test utility from [the starter package](https://www.npmjs.com/package/theia-extension-tester) is used then in the project root create an .env file containing:

```env
# Log in username
CHE_USERNAME=

# Log in password
CHE_PASSWORD=

# In case of form is not multi step by default
CHE_MULTI_STEP_FORM=0

# If login method button text is different than default one ("DevSandbox")
CHE_LOGIN_METHOD=my_htpasswd_provider
```
