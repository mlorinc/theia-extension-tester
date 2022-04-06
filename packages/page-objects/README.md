# `page-objects`

This package provides a collection of Eclipse Theia page objects.
Page object is a class which extends from Selenium WebDriver WebElement class and represents one element in user interface.
Every page object must implement an interface from an [extension-tester-page-objects package](https://www.npmjs.com/package/extension-tester-page-objects).
These interfaces aim to make [theia-extension-tester](https://www.npmjs.com/package/theia-extension-tester) and
[vscode-extension-tester](https://www.npmjs.com/package/vscode-extension-tester) compatible between each other.
This package also contains helper page objects which are not mandated to implement any interface from
the [extension-tester-page-objects](https://www.npmjs.com/package/extension-tester-page-objects).

## Page object status

At this moment partial support is provided for page objects. To see which page objects are supported please see
[the page object status table](https://github.com/mlorinc/theia-extension-tester/wiki/Page-objects-status).
