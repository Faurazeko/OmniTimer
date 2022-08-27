"use strict";

var TimerElem = $("#TimerElem");
var AudioElem = $("#Audio");

var StudyHrElem = $("#studyHr");
var StudyMinElem = $("#studyMin");
var StudySecElem = $("#studySec");

var BreakHrElem = $("#breakHr");
var BreakMinElem = $("#breakMin");
var BreakSecElem = $("#breakSec");

var TitleElem = $("#TimerTitle");

var MiddleButtonsList = $("#MiddleButtonsList");

var PauseBtn = $("#PauseBtn");
var StudyBtn = $("#StudyBtn");
var BreakBtn = $("#BreakBtn");

var ControlPanel = $("#ControlPanel");

var BlinkerInterval = -1;
var TimerInterval = -1;

var CountDownDateTime;
var IsPause = false;

var CurrentTitle = "nothing";

function StartStudy()
{
    var hr = localStorage.getItem("studyHr");
    var min = localStorage.getItem("studyMin");
    var sec = localStorage.getItem("studySec");

    CurrentTitle = "study";

    StartTimer(hr, min, sec);
}

function StartBreak()
{
    var hr = localStorage.getItem("breakHr");
    var min = localStorage.getItem("breakMin");
    var sec = localStorage.getItem("breakSec");

    CurrentTitle = "break";

    StartTimer(hr, min, sec);
}

async function StartTimer(hr, min, sec)
{
    ControlPanel.fadeOut("fast");
    IsPause = false;
    PauseBtn.text("Pause");
    clearInterval(TimerInterval);
    ShutTheTimer(true);

    if (PauseBtn.css("display") == "none")
    {
        MiddleButtonsList.children().fadeOut("slow").delay(2000).last().fadeIn("slow");
    }

    TimerElem.text(GetTimerString(0, hr, min, sec))

    ChangeTitle(CurrentTitle, () => StartInterval(hr, min, sec));
}

async function ChangeTitle(title, func)
{
    TitleElem.slideUp(() => TitleElem.text(title)).delay(500).slideDown(func);
}

function ToggleTimer()
{
    var newTitle;
    var func;
    if (IsPause)
    {
        newTitle = CurrentTitle;
        PauseBtn.text("Pause");
        func = IsPause = !IsPause;
    }
    else
    {
        newTitle = `Pause (${ CurrentTitle })`
        PauseBtn.text("Resume");
        IsPause = !IsPause;
    }

    ChangeTitle(newTitle, func);
}

function StartInterval(hr, min, sec)
{
    clearInterval(TimerInterval);
    CountDownDateTime = new Date().getTime() + (hr * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000);

    var intervalMs = 100;

    TimerInterval = setInterval(function ()
    {
        if (IsPause)
        {
            CountDownDateTime += intervalMs;
            return;
        }

        var now = new Date().getTime();

        var distance = CountDownDateTime - now;

        var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);

        TimerElem.text(GetTimerString(days, hours, minutes, seconds));

        if (distance < 0)
        {
            PauseBtn.fadeOut();
            clearInterval(TimerInterval);
            TimerInterval = -1;
            TimerElem.css("color", "red");
            TimerElem.text("00:00:00");
            AudioElem[0].play();
            BlinkerInterval = setInterval(() =>
            {
                TimerElem.text("00:00:00");
                if (TimerElem.css("color") == "rgb(255, 0, 0)")
                {
                    TimerElem.css("color", "black")
                }
                else
                {
                    TimerElem.css("color", "red")
                }
            }, 1000);
        }
    }, intervalMs);

}

function GetTimerString(days, hours, minutes, seconds)
{
    var numbers = [days, hours, minutes, seconds];

    var result = "";

    for (var i = 0; i < numbers.length; i++)
    {
        var elem = numbers[i];

        if (i == 0 && elem <= 0)
        {
            continue;
        }

        if (elem.toString().length < 2)
        {
            elem = "0" + elem;
        }

        var string = elem;

        if (i + 1 < numbers.length)
        {
            string += ":";
        }

        result += string;

    }

    return result;
}

function ShutTheTimer(noFancy)
{
    if (BlinkerInterval < 0)
    {
        return;
    }

    if (!noFancy || noFancy == undefined)
    {
        ChangeTitle("nothing");

        if (CurrentTitle == "study")
        {
            BreakBtn.fadeIn();
        }
        else if (CurrentTitle == "break")
        {
            StudyBtn.fadeIn();
        }
    }

    clearInterval(BlinkerInterval);
    BlinkerInterval = -1;
    TimerElem.css("color", "");
    AudioElem[0].pause();
    AudioElem[0].currentTime = 0;
    ControlPanel.fadeIn("fast");
}

function LoadTimerValues()
{
    var items = {
        "studyHr": StudyHrElem, "studyMin": StudyMinElem, "studySec": StudySecElem,
        "breakHr": BreakHrElem, "breakMin": BreakMinElem, "breakSec": BreakSecElem
    };

    for (const [key, value] of Object.entries(items))
    {
        var number = localStorage.getItem(key);

        if (localStorage.getItem(key) == null)
        {
            localStorage.setItem(key, 0);
            number = 0;
        }

        value.text(number);
    }
}

function OnTimerValuesInput(element)
{
    if (element.text() == "")
    {
        return;
    }

    localStorage.setItem(element.attr("id"), element.text())
}

function InputValidation(evt)
{
    var ASCIICode = (evt.which) ? evt.which : evt.keyCode
    if (ASCIICode > 31 && (ASCIICode < 48 || ASCIICode > 57))
        return false;
    return true;
}

$(document).ready(function () 
{
    document.addEventListener("click", () => ShutTheTimer(false))
    LoadTimerValues();
})