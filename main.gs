var ScriptProperties = PropertiesService.getScriptProperties()
var FROM_CALENDAR_ID = ScriptProperties.getProperty('FROM_CALENDAR_ID');
var TO_CALENDAR_ID = ScriptProperties.getProperty('TO_CALENDAR_ID');

function setInitialSync() {
  // token を取得
  var optionalArgs = {
    timeMin: (new Date()).toISOString(),
    maxResults: 100,
  };
  do {
    var events = Calendar.Events.list(FROM_CALENDAR_ID, optionalArgs);
    pageToken = events.nextPageToken;
    optionalArgs.pageToken = pageToken;
  } while (pageToken);
  var nextSyncToken = events.nextSyncToken;

  // token をユーザプロパティに保存
  var userProperties = PropertiesService.getUserProperties();
  userProperties.setProperty('syncToken', nextSyncToken);
}

function createEvent(calendar, startTime, endTime) {
  // カレンダー (CalendarEvent) を作成する
  let event = calendar.createEvent('OoO', startTime, endTime);
  event.setVisibility(CalendarApp.Visibility.PRIVATE);
  let iCalUID = event.getId();
  return iCalUID;
}

function updateEvent(calendar, iCalUID, startTime, endTime) {
  // カレンダー (CalendarEvent) の開始終了時刻を更新する
  let event = calendar.getEventById(iCalUID);
  if (event === null) {
    Logger.log('Event not found', iCalUID);
    return;
  }
  event.setTime(startTime, endTime);
}

function deleteEvent(calendar, iCalUID) {
  // カレンダー (CalendarEvent) を削除する
  let event = calendar.getEventById(iCalUID);
  if (event === null) {
    Logger.log('Event not found', iCalUID);
    return;
  }
  event.deleteEvent();
}

// カレンダーを変更した際にトリガーされる
function onCalendarEdit() {
  // コピー先のカレンダーを取得
  let calendar = CalendarApp.getCalendarById(TO_CALENDAR_ID);
  if (calendar === null) {
    // Calendar not found
    console.log('Calendar not found', calendar);
    return;
  }

  // ユーザプロパティから syncToken を取得
  var userProperties = PropertiesService.getUserProperties();
  var nextSyncToken = userProperties.getProperty('syncToken');

  // syncToken 以降のカレンダーの変更イベントを取得
  var optionalArgs = {
    syncToken: nextSyncToken,
    maxResults: 100,
  };
  do {
    var events = Calendar.Events.list(FROM_CALENDAR_ID, optionalArgs);

    // コピー先カレンダーの更新
    for (var item of events.items) {
      Logger.log(item);

      // ユーザプロパティから iCalUID を取得
      let iCalUID = userProperties.getProperty(item.id);
      if (item.status == 'confirmed'){
        if (iCalUID === null){
          // ユーザプロパティに iCalUID が未登録なら新規作成
          iCalUID = createEvent(calendar, new Date(item.start.dateTime), new Date(item.end.dateTime));
          // iCalUID を保存
          userProperties.setProperty(item.id, iCalUID); // item.id -> iCalUID
        } else {
          // ユーザプロパティに iCalUID が登録済みなら更新
          updateEvent(calendar, iCalUID, new Date(item.start.dateTime), new Date(item.end.dateTime));
        }
      }else if (item.status == 'cancelled'){
        // 削除
        deleteEvent(calendar, iCalUID);
        userProperties.deleteProperty(item.id);
      }
    }

    pageToken = events.nextPageToken;
    optionalArgs.pageToken = pageToken;
  } while (pageToken);

  // syncToken をユーザプロパティに保存
  var nextSyncToken = events.nextSyncToken;
  userProperties.setProperty('syncToken', nextSyncToken);
}


function getUserProperties (){
  var userProperties = PropertiesService.getUserProperties();
  Logger.log(userProperties.getProperties());
}
