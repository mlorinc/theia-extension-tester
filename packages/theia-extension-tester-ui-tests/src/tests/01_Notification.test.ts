import {
    EditorView,
    INotification,
    INotificationsCenter,
    InputBox,
    NotificationType,
    until,
    Workbench
} from '@theia-extension-tester/page-objects';
import { expect } from 'chai';
import { repeat } from '@theia-extension-tester/repeat';

// File has prefix 01, so it is not influenced by others tests (Copy Path command does not work if any file has been opened.).
describe('Notifications', function () {
    this.timeout(40000);

    beforeEach(async function () {
        await new EditorView().closeAllEditors();
    });

    describe('NotificationsCenter', function () {
        afterEach(async function () {
            const center = await new Workbench().openNotificationsCenter();
            await center.close();
        });

        it('close', async function () {
            const center = await new Workbench().openNotificationsCenter();
            expect(await center!.isDisplayed()).to.be.true;
            await center.close();
            expect(await center!.isDisplayed()).to.be.false;
        });

        it('clearAllNotifications', async function () {
            await createNotifications(true);
            let center = await new Workbench().openNotificationsCenter();
            await center.clearAllNotifications();
            center = await new Workbench().openNotificationsCenter();
            await repeat(async () => (await center.getNotifications(NotificationType.Any)).length === 0, { timeout: 5000 });
        });

        it('getNotifications', async function () {
            const center = await new Workbench().openNotificationsCenter();
            await createNotifications(true);
            expect((await center.getNotifications(NotificationType.Any)).length).least(2);
        });
    });

    let notificationType = [false, true];

    for (const type of notificationType) {
        describe(`Notification - ${type ? 'center' : 'standalone'}`, async function () {
            interface NotificationDetails {
                icon: NotificationType;
                source: string;
            }

            const notificationDetails: { [message: string]: NotificationDetails } = {
                'Open a file first to copy its path': {
                    icon: NotificationType.Info,
                    source: ''
                },
                "Please use the browser's paste command or shortcut.": {
                    icon: NotificationType.Warning,
                    source: ''
                }
            }

            beforeEach(async function () {
                const center = await new Workbench().openNotificationsCenter();
                await center.clearAllNotifications();
                await createNotifications(type);
            });

            it('getMessage', async function () {
                for (const message of Object.keys(notificationDetails)) {
                    await getNotification(message, type);
                }
            });

            it('getType', async function () {
                for (const message of Object.keys(notificationDetails)) {
                    const notification = await getNotification(message, type);
                    expect(await notification.getType()).equals(notificationDetails[message].icon);
                }
            });

            it('getSource', async function () {
                for (const message of Object.keys(notificationDetails)) {
                    const notification = await getNotification(message, type);
                    expect(await notification.getSource()).equals(notificationDetails[message].source);
                }
            });


            it('dismiss', async function () {
                for (const message of Object.keys(notificationDetails)) {
                    const notification = await getNotification(message, type);
                    await notification.dismiss();
                    try {
                        await notification.isDisplayed();
                        expect.fail('This should be unreachable.');
                    } catch {
                        // expected, continue
                        continue;
                    }
                }
            });

            it.skip('hasProgress', async function () {

            });

            it.skip('getActions', async function () {

            });

            it.skip('takeAction', async function () {

            });

            it('openContextMenu', async function () {
                try {
                    const notification = await getNotification(Object.keys(notificationDetails)[0], type);
                    await notification.openContextMenu();
                    expect.fail('This code should not be reachable.');
                }
                catch {
                    // expected
                }
            });
        });
    }
});

async function createNotifications(useCenter: boolean) {
    const workbench = new Workbench();

    let center: INotificationsCenter | undefined;

    center = await workbench.openNotificationsCenter();
    await center.clearAllNotifications();
    await center.close();

    if (useCenter) {
        center = await workbench.openNotificationsCenter();
    }
    else {
        center = undefined;
    }

    await workbench.executeCommand('Paste');
    await workbench.getDriver().wait(until.elementIsNotVisible(new InputBox()));
    await workbench.executeCommand('Copy Path');
    await workbench.getDriver().wait(until.elementIsNotVisible(new InputBox()));

    await repeat(async () => {
        let matches = 0;
        const notifications = (await center?.getNotifications(NotificationType.Any)) ?? (await workbench.getNotifications());
        for (const notification of notifications) {
            try {
                const message = await notification.getMessage();

                if (message.startsWith('Open a file') || message.startsWith('Please use the browser')) {
                    matches += 1;
                }
            }
            catch (e) {
                if (e.name === 'StaleElementReferenceError') {
                    break;
                }
                throw e;
            }
        }
        return matches === 2;
    }, {
        timeout: 20000,
        message: 'Could not create notifications'
    });
}

async function getNotification(message: string, useCenter: boolean): Promise<INotification> {
    let center: INotificationsCenter | undefined;

    if (useCenter) {
        center = await new Workbench().openNotificationsCenter();
    }

    return await repeat(async () => {
        const notifications = useCenter ? (await center!.getNotifications(NotificationType.Any)) : (await new Workbench().getNotifications());
        for (const notification of notifications) {
            if (await notification.getMessage() === message) {
                return notification;
            }
        }
        return undefined;
    }, {
        timeout: 9000,
        message: `Could not get notification with message "${message}".`
    }) as INotification;
}
