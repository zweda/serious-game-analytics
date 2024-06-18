using UnityEngine;
using AptabaseSDK;
using System.Collections.Generic;
using System;

static class DataCollection
{
    public static readonly string ADDITIONAL_DATA_EVENT_KEY = "additional-data-for";
    public static readonly string ACTION_EVENT_KEY = "action";
    public static readonly string CONTEXT_EVENT_KEY = "context-changed";
    public static readonly string GAME_LAUNCH_EVENT_KEY = "game-launch";
    public static readonly string GAME_EXIT_EVENT_KEY = "game-exited";
    public static readonly string DATA_COLLECTION_SERVICE_NAME = "DataCollectionService";
    private static bool launched = false;
    private static bool allowed = true;
    private static Dictionary<string, object> context = null;

    public static void GameLaunched()
    {
        if (!launched)
        {
            Aptabase.TrackEvent(GAME_LAUNCH_EVENT_KEY);
            Aptabase.Flush();
            launched = true;

            // promt user with data collection agreement window
            GameObject userFormManager = new GameObject(DATA_COLLECTION_SERVICE_NAME);
            userFormManager.AddComponent<UserFormManager>();
        }
    }

    public static void GameExit()
    {
        launched = false;
        Aptabase.TrackEvent(GAME_EXIT_EVENT_KEY);
        Aptabase.Flush();
    }

    public static void PreventDataCollection()
    {
        allowed = false;
    }

    public static void SetContext(Dictionary<string, object> ctx)
    {
        if (!allowed) return;
        if (!AreDictionariesEqual<string, object>(ctx, context))
        {
            Aptabase.TrackEvent(CONTEXT_EVENT_KEY, ctx);
            Aptabase.Flush();
        }
        context = ctx;
    }

    public static void ExtendContext(string field, object value)
    {
        Dictionary<string, object> ctx;
        if (context == null) ctx = new Dictionary<string, object>();
        else ctx = new Dictionary<string, object>(context);

        ctx[field] = value;
        SetContext(ctx);
    }

    public static void ReduceContext(string field)
    {
        Dictionary<string, object> ctx;
        if (context == null) ctx = null;
        else ctx = new Dictionary<string, object>(context);

        ctx?.Remove(field);
        SetContext(ctx);
    }

    public static void GenerateEvent(
        string eventName,
        Dictionary<string, object> data = null,
        Dictionary<string, object> additionalData = null
    )
    {
        if (!allowed) return;
        if (!KeyNameValid(eventName))
        {
            Debug.LogWarning("Illegal event name: " + eventName);
            return;
        }

        Dictionary<string, object> dataToSend = null;
        Dictionary<string, object> additData = null;

        if (data != null)
        {
            string eventGUID = Guid.NewGuid().ToString();
            dataToSend = data;
            dataToSend["id"] = eventGUID;

            if (additionalData != null)
            {
                additData = additionalData;
                additData["eventId"] = eventGUID;
            }
        }

        if (additData != null) Aptabase.TrackEvent(ADDITIONAL_DATA_EVENT_KEY + "-" + eventName, additData);
        Aptabase.TrackEvent(eventName, dataToSend);
        Aptabase.Flush();
    }

    public static void GenerateActionEvent(string eventName, string action)
    {
        if (!allowed) return;
        if (!KeyNameValid(eventName))
        {
            Debug.LogWarning("Illegal event name: " + eventName);
            return;
        }

        if (!ActionNameValid(action))
        {
            Debug.LogWarning("Illegal action name: " + action);
            return;
        }

        Aptabase.TrackEvent(ACTION_EVENT_KEY + "-" + eventName, new Dictionary<string, object>{
            {"value", action},
        });
        Aptabase.Flush();
    }

    private static bool KeyNameValid(string key)
    {
        if (string.IsNullOrEmpty(key)) return false;
        if (key.StartsWith(ADDITIONAL_DATA_EVENT_KEY)
            || key.StartsWith(ACTION_EVENT_KEY)
            || key.StartsWith(CONTEXT_EVENT_KEY)
            || key.StartsWith(GAME_LAUNCH_EVENT_KEY)
            || key.StartsWith(GAME_EXIT_EVENT_KEY)) return false;

        return true;
    }

    private static bool ActionNameValid(string action)
    {
        if (string.IsNullOrEmpty(action)) return false;

        return true;
    }

    public static void SaveUserData(string email, int age, string gender)
    {
        if (!allowed) return;
        Dictionary<string, object> data = new Dictionary<string, object>
        {
            { "email", email },
            { "age", age },
            { "gender", gender }
        };

        Aptabase.TrackEvent("user-data", data);
        Aptabase.Flush();
    }

    private static bool AreDictionariesEqual<TKey, TValue>(Dictionary<TKey, TValue> dict1, Dictionary<TKey, TValue> dict2)
    {
        if (dict1 == null || dict2 == null)
        {
            return dict1 == dict2;
        }

        if (dict1.Count != dict2.Count)
        {
            return false;
        }

        foreach (var kvp in dict1)
        {
            TValue value2;
            if (!dict2.TryGetValue(kvp.Key, out value2)) return false;
            if (!EqualityComparer<TValue>.Default.Equals(kvp.Value, value2)) return false;
        }

        return true;
    }
}
