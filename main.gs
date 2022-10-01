var PRIVATE_CALENDAR_ID = '';
var WORK_CALENDAR_ID = '';

var FROM_CALENDAR_ID = PRIVATE_CALENDAR_ID;
var TO_CALENDAR_ID = PRIVATE_CALENDAR_ID;

function setInitialSync() {
  // token を取得
  var optionalArgs = {
    timeMin: (new Date()).toISOString()
  };
  var events = Calendar.Events.list(FROM_CALENDAR_ID, optionalArgs);
  var nextSyncToken = events.nextSyncToken;

  // token をユーザプロパティに保存
  var properties = PropertiesService.getUserProperties();
  properties.setProperty('syncToken', nextSyncToken);
}

function createEvent(item) {
  // 新しいカレンダーを作成する
  let event_options = {
    summary: 'OoO',
    start: item.start,
    end: item.end,
  }
  try {
    // call method to insert/create new event in provided calandar
    event = Calendar.Events.insert(event_options, TO_CALENDAR_ID);
    Logger.log('Successfully created event: ' + event.id);
  } catch (err) {
    Logger.log('Failed with error %s', err.message);
  }
  return event;
}

function updateEvent(item, event_id) {
  // カレンダーの開始終了時刻を更新する
  try {
    event = Calendar.Events.get(TO_CALENDAR_ID, event_id, {}, {});
    event.start = item.start;
    event.end = item.end;
    event = Calendar.Events.update(
        event,
        TO_CALENDAR_ID,
        event.id,
        {},
        {}
    );
    Logger.log('Successfully updated event: ' + event.id);
  } catch (e) {
    Logger.log('Fetch threw an exception: ' + e);
  }
  return event
}

function deleteEvent(event_id) {
  // カレンダーを削除扱いにする (delete できなかった)
  try {
    event = Calendar.Events.get(TO_CALENDAR_ID, event_id, {}, {});
    event.summary = 'cancelled';
    event = Calendar.Events.update(
        event,
        TO_CALENDAR_ID,
        event.id,
        {},
        {}
    );
    Logger.log('Successfully updated event: ' + event.id);
  } catch (e) {
    Logger.log('Fetch threw an exception: ' + e);
  }
  return event
}

// カレンダーを変更した際にトリガーされる
function onCalendarEdit() {
  // ユーザプロパティから token を取得する
  var properties = PropertiesService.getUserProperties();
  var nextSyncToken = properties.getProperty('syncToken');
  
  // syncToken 以降に変更されたカレンダーを取得
  var optionalArgs = {
    syncToken: nextSyncToken
  };
  var events = Calendar.Events.list(FROM_CALENDAR_ID, optionalArgs);
  // Logger.log(events);

  // カレンダーの更新
  for (var item of events.items) {
    // TODO 後で消す
    // 自分のカレンダーに作成してるので
    if (item.summary == 'OoO') {
      continue;
    }
    if (item.summary == 'cancelled') {
      continue;
    }

    Logger.log(item);
    var event_id = properties.getProperty(item.id);
    if (item.status == 'confirmed'){
      if (event_id === null){
        // ユーザプロパティに未登録なら新規作成
        new_event = createEvent(item);

        // event_id の対応を保存
        properties.setProperty(item.id, new_event.id);
      } else {
        // ユーザプロパティに登録済みなら更新
        new_event = updateEvent(item, event_id);
      }
    }else if (item.status == 'cancelled'){
      // 削除する
      new_event = deleteEvent(event_id);
      properties.deleteProperty(item.id);
    }
  };

  // token をユーザプロパティに保存
  var nextSyncToken = events.nextSyncToken;
  properties.setProperty('syncToken', nextSyncToken);
}


function getUserProperties (){
  var properties = PropertiesService.getUserProperties();
  Logger.log(properties.getProperties());
}
