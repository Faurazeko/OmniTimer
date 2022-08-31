"use strict";

var TimerElem = $("#TimerElem");
var AudioElem = $("#Audio");

var StudyHrElem = $("#StudyHr");
var StudyMinElem = $("#StudyMin");
var StudySecElem = $("#StudySec");

var BreakHrElem = $("#BreakHr");
var BreakMinElem = $("#BreakMin");
var BreakSecElem = $("#BreakSec");

var TitleElem = $("#TimerTitle");

var MiddleButtonsList = $("#MiddleButtonsList");

var PauseBtn = $("#PauseBtn");
var StudyBtn = $("#StudyBtn");
var BreakBtn = $("#BreakBtn");

var ControlPanel = $("#ControlPanel");

var BlinkerInterval = -1;
var TimerInterval = -1;

var CountDownDateTime = null;
var PauseDateTime = null;
var IsPause = false;

const IdleTitle = "nothing";
const StudyTitle = "study";
const BreakTitle = "break";

var CurrentTitle = IdleTitle;

function StartStudy()
{
    var hr = localStorage.getItem("StudyHr");
    var min = localStorage.getItem("StudyMin");
    var sec = localStorage.getItem("StudySec");

    CurrentTitle = StudyTitle;

    StartTimer(hr, min, sec);
}

function StartBreak()
{
    var hr = localStorage.getItem("BreakHr");
    var min = localStorage.getItem("BreakMin");
    var sec = localStorage.getItem("BreakSec");

    CurrentTitle = BreakTitle;

    StartTimer(hr, min, sec);
}

async function StartTimer(hr, min, sec)
{
    ControlPanel.fadeOut("fast");
    ResumeTimer();
    clearInterval(TimerInterval);
    ShutTheTimer();

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
    if (IsPause)
    {
        ResumeTimer();
    }
    else
    {
        PauseTimer()
    }
}

function PauseTimer()
{
    if (PauseDateTime != null)
    {
        return;
    }

    var newTitle = `Pause (${ CurrentTitle })`;
    PauseDateTime = new Date().getTime();

    ProcessPauseStateChange("Resume", newTitle);
}

function ResumeTimer()
{
    if (PauseDateTime == null)
    {
        return;
    }

    var newTitle = CurrentTitle;
    CountDownDateTime += new Date().getTime() - PauseDateTime;
    PauseDateTime = null;

    ProcessPauseStateChange("Pause", newTitle);

    IsPause = false;
}

function ProcessPauseStateChange(newPauseBtnText, newTitle)
{
    PauseBtn.text(newPauseBtnText);
    ChangeTitle(newTitle);
    IsPause = !IsPause;
}

function StartInterval(hr, min, sec)
{
    clearInterval(TimerInterval);
    CountDownDateTime = new Date().getTime() + (hr * 60 * 60 * 1000) + (min * 60 * 1000) + (sec * 1000);

    var intervalMs = 500;

    TimerInterval = setInterval(function ()
    {
        if (IsPause)
        {
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

function ShutTheTimer()
{
    if (BlinkerInterval < 0)
    {
        return;
    }

    ChangeTitle(IdleTitle);

    if (CurrentTitle == StudyTitle)
    {
        BreakBtn.fadeIn();
    }
    else if (CurrentTitle == BreakTitle)
    {
        StudyBtn.fadeIn();
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
        "StudyHr": StudyHrElem, "StudyMin": StudyMinElem, "StudySec": StudySecElem,
        "BreakHr": BreakHrElem, "BreakMin": BreakMinElem, "BreakSec": BreakSecElem
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
    var newValue = element.text();

    if (newValue == "")
    {
        newValue = 0;
    }

    localStorage.setItem(element.attr("id"), newValue)
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
    document.addEventListener("click", () => ShutTheTimer())
    LoadTimerValues();
})