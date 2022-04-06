# `theia-element`

This package provides more specific implementation than [@theia-extension-tester/abstract-element](https://www.npmjs.com/package/@theia-extension-tester/abstract-element) does. Abstract element is meant to be more abstract whereas TheiaElement is supposed to be tailored specifically for
Eclipse Theia editors. TheiaElement enhances AbstractElement with new getters which are tied to Theia locator properties.

With TheiaElement are bundled locators as well. Locators are used to make page objects version independent so it is possible to work
with multiple Eclipse Theia releases. Locators use Selenium WebDriver locator object but extra metadata are bundled.

## Usage

Install via npm

`npm install @theia-extension-tester/theia-element`

Install via yarn

`yarn add @theia-extension-tester/theia-element`

TheiaElement is in the most cases used as super class for new page objects but there is one useful use case outside that.
It can be used for element searching and utilize recovery algorithms when searching.

Search custom element example:

```ts
const element = new TheiaElement(By.id("weather-panel"));
```

### Creating locators for new version

To adapt locators to new version, create new file with format which can be seen in `./src/locators/theia/versions`.
Versions can be skipped but it is better not to. The new file must export the following code:

```ts
export const diff: LocatorDiff = {
    ...changedLocators
}
```