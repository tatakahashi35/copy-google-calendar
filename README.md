# share-private-calendar

## Overview
copy a schedule created in Google Calendar A (Calender_A) to Google Calendar B (Calender_B). If you update or cancel it in Calender_A, it will apply to Calender_B.
It is supposed to copy schedules from your personal calendar to your business calendar. It is because all colleagues need set to view your calendar.

## Note
- Created schedules in the Calender_B are Private.
- Master schedule is Calender_A. If you update Calender_B, schedules in Calender_A will not be updated.

## Usege
Create the Google App Scripts Project in the Google Account, which has Calendar_B since Calendar_B is a business one.

### Setting of Google Calendar
##### Setting of Google Calender A
- Add a user with Calender_B in the Share with specific people in the Setting and Sharing to share Calendar_A. 
  - Permissions: See only free/busy (hide details)

##### Setting of Google Calendar B
There is no need to do particular settings.


### Google App Script の設定
- Create a new project in the Google Account which has Calendar_B
- Copy `main.gs`
- Add the `Calendar` from Services
- Execute `setInitialSync` function
- Create trigger
  - Choose which function to run: `onCalendarEdit`
  - Select event source: From calendar
  - Enter calendar details: Calender updated
  - Calendar owner email: email address of Calendar_A
- Set Script Properties
  - FROM_CALENDAR_ID: email address of Calendar_A
  - TO_CALENDAR_ID: email address of Calendar_B

With the above settings, if you update the schedule in Calender_A, it will be applied to Calender_B.

### References
- https://developers.google.com/apps-script/advanced/calendar
- https://developers.google.com/apps-script/reference/calendar/calendar-app
- https://developers.google.com/apps-script/reference/calendar/calendar-event
