# `locator-loader`

Modern web application constantly change and to ensure minimum
quality requirements are met we test them. When creating new tests it
is usually good pattern to split locators from test logic. However
every update can potentially break those locators and as result break
the tests.

This package was created to manage various versions of locators.
Not necessary locators because the package can work with generic data.
The package consists of 3 components.

1. Locator loader - Load locators and apply diff changes.
2. Locators - Key structure which must be partially exported by every version,
3. Base locators - Initial locator file. The file must define every locator used in the tests.
4. Diff locators - Locator changes. It must define only changed locators.

## How to prepare locator structure

All base locators and locator changes must be in single directory. Locator file names must be in valid [compare-versions](https://www.npmjs.com/package/compare-versions) format. 

Let's assume we have just created ./locators/versions directory. 
First we must define our locator structure
and create custom locator loader class.

```ts
// ./locators/MyLocators.ts

// Locator structure.
// Locator type can be Selenium By object or any other object.
export interface MyLocators {
    countryInput: Locator;
    personData: {
        firstNameInput: Locator;
        lastNameInput: Locator;
    }
    submit: Locator;
}
```

Define locator loader.

```ts
// ./locators/MyLocatorLoader.ts
import * as path from "path";
import { LocatorLoader } from "@theia-extension-tester/locator-loader";
import { MyLocators } from "./MyLocators";

// It is better to export path than using hardcoded ones.
export function getBaseLocatorFolder() {
    // __dirname := ./locators
    return path.join(__dirname, "versions");
}

// Locator structure. It is possible to create object directly new LocatorLoader<MyLocators>(...) as well.
export class MyLocatorLoader extends LocatorLoader<MyLocators> {
    constructor(version: string, baseVersion: string, baseFolder?: string) {
        super(version, baseVersion, baseFolder ?? getBaseLocatorFolder());
    }
}
```

After that it is possible to load locators but at this moment nothing can be loaded. To change that, follow [create base locator guide](#create-base-locators).

```ts
// ./main.ts

import { MyLocatorLoader } from "./locators/MyLocatorLoader";
import { MyLocators } from "./MyLocators";

// Load locators
const locatorLoader = new MyLocatorLoader("2.4.1", "1.0.0");
const locators: MyLocators = locatorLoader.loadLocators();
```

## Create base locators

Base locators are included in single file which in this guide is referred as version *1.0.0*.
The file must export `locators: MyLocators` variable. The variable name **must not** have different name
and the variable must be legal TypeScript object (all mandatory properties must be defined).

For example:

```ts
// ./locators/versions/1.0.0.ts

export const locators: MyLocators = {
    countryInput: By.className("countryInput"),
    personData: {
        firstNameInput: By.className("firstNameInput"),
        lastNameInput: By.className("lastNameInput"),
    }
    submit: By.id("submit")
}
```

## Patch changed locators

To create new patched locators, create new file `./locators/versions/x.y.z.ts`. Versions may be skipped but
the latest changes must be in file which has the highest version. Let's assume all inputs were migrated
to use name attributes instead except the submit button.

Create new patch file *1.0.1.ts* (version can be arbitrary but must be lower or equal than version used in locator loader).
File format is similar to base locator file format but different variable is exported.

```ts
// ./locators/versions/1.0.0.ts
import { LocatorDiff } from "@theia-extension-tester/locator-loader";

export const diff: LocatorDiff<MyLocators> = {
    countryInput: By.name("country"),
    personData: {
        firstNameInput: By.name("firstName"),
        lastNameInput: By.name("lastName"),
    }
    // Unchanged locators do not have to be redefined.
    //submit: By.id("submit")
}
```

And thats all. For every version create new file and loader will apply changes.
