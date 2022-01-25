import { By } from "extension-tester-page-objects";
import { locators as baseLocators } from "../../che/versions/1.10.0";
import { TheiaLocators } from "../../..";

baseLocators.dashboard.menu.locator = By.id('chenavbar');
baseLocators.widgets.list.locator = By.css('md-list');
baseLocators.widgets.listItem.locator = By.css('md-list-item');

baseLocators.widgets.tabs.locator = By.css('md-tabs');
baseLocators.widgets.tab.locator = By.css('md-tab-item');
baseLocators.widgets.tabContent.locator = By.css('md-tab-content');

export const locators: TheiaLocators = baseLocators;
