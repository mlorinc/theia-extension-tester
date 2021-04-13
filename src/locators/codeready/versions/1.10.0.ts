import { By } from "selenium-webdriver";
import { locators as baseLocators } from "../../che/versions/1.10.0";
import { TheiaLocators } from "../../TheiaLocators";

baseLocators.widgets.editorFrame.locator = By.id('ide-application-iframe');

baseLocators.dashboard.menu.locator = By.id('chenavbar');
baseLocators.widgets.list.locator = By.css('md-list');
baseLocators.widgets.listItem.locator = By.css('md-list-item');

baseLocators.widgets.tabs.locator = By.css('md-tabs');
baseLocators.widgets.tab.locator = By.css('md-tab-item');
baseLocators.widgets.tabContent.locator = By.css('md-tab-content');

export const locators: TheiaLocators = baseLocators;
