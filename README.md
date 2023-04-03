# Periodic-Reminders

## Configuration Menu
The button to open the config menu can be found in the toolbar of the notes layer.

## Trigger Types

#### Combat Start
Causes a reminder to trigger when the user's character is a combatant in a combat that begins, or a combat begins and the user is a GM.

#### Login
Causes a reminder to trigger upon the user logging in.

#### Round
Causes a reminder to trigger when the user's character is a combatant in a combat that advances to a new round, or a combat advances to a new round and the user is a GM.

#### Timer
Causes a reminder to trigger in a periodic fashion, with a period specified in minutes, by the user.

#### Turn
Causes a reminder to trigger a number of turns before or after the user's character's turn; the number of turns being specified by the user, with negative values resulting in the reminder being triggered some number of turns before the character's turn, zero resulting in the reminder being triggered on the character's turn, and positive values resulting in the reminder being triggered some number of turns after the character's turn.


## Application Links
When a reminder triggers, its linked applications will be rendered. If the user has used the *arrange* feature to position and resize the applications, they will each be rendered with their saved position and size.

#### Adding Application Links
To add an application to the reminder, simply drag the ui element that opens the application onto the *Application Links* header or list of application links. Various elements such as items, character sheets, journal entries, card piles, roll tables, and macros can be added to a reminder as a valid application link. *Note:* Periodic Reminders does not currently support the creation of application links for embedded compendium content.

#### Removing Application Links
To remove an application link, click the unlink button on the right side of the application link.

#### Arranging Application Links
To set the pop-up locations and sizes of the linked applications for when the reminder triggers, click the *Arrange* button on the right side of an *Application Links* header. Then, move and resize the applications to the desired locations and sizes. Finally, click the save button on the *Arrange Applications* pop-up.
