let start = true;
let select = false;
let boxToSelect = [];
let maxBoxToSelect = 0;
let currentBoxToSelect = 0;
let highestBox = 1;
let timer = 0;

$(document).ready(function()
{
    /*
    Called when one of the square buttons is pressed,
    process actions on button pressed
    */
    $(".memory-select").on("click", function()
    {
        //Check if button is selectable
        if (!select)
        {
            return;
        }
        
        //Set all selectable tiles color from blue to grey, so green or red can be set afterward
        select = false;
        SetAllSelectColor("grey");
        
        if ($(this).hasClass("memory-correct"))
        {
            //Correct square pressed, set color green
            SetColor($(this), "green");
            
            if (currentBoxToSelect < maxBoxToSelect)
            {
                //Show green color for short time, then reset colors for next select
                setTimeout(SetNextSelect, 250);
            }
            else
            {
                //Level complete, update counters and start next level
                maxBoxToSelect++;
                if (highestBox < maxBoxToSelect)
                {
                    highestBox = maxBoxToSelect;
                }
                
                $("#counter-current").text(currentBoxToSelect + 1);
                $("#counter-highest").text(highestBox);
                
                timer = 0; //pause timer
                currentBoxToSelect = 0;
                setTimeout(SetAllSelectColor, 250, "grey");
                setTimeout(StartDisplay, 300);
            }
        }
        else
        {
            //Wrong square pressed, set colors and end game
            SetColor($(".memory-correct"), "green");
            SetColor($(this), "red");
            SetColor($(".memory-start"), "blue");
            select = false;
        }
    });
    
    /*
    Called when start/restart button is pressed,
    process actions on button pressed
    */
    $(".memory-start").on("click", function()
    {
        //If game already started, don't do anything
        if (!start)
        {
            return;
        }
        
        //The game has started, reset variables
        start = false;
        boxToSelect = [];
        maxBoxToSelect = 1;
        currentBoxToSelect = 0;
        
        //Set button color to grey with restart text
        SetColor($(this), "grey");
        $(this).text("Restart");
        
        //Start the game
        StartDisplay();
        
        $("#counter-current").text(1);
        $("#counter-highest").text(highestBox);
    });
});

function StartDisplay()
{
    if (currentBoxToSelect < maxBoxToSelect)
    {
        if (currentBoxToSelect <= boxToSelect.length)
        {
            //Add new square from list of already-selected squares to the list
            const random = Math.floor(Math.random() * $(".memory-select").length);
            boxToSelect.push(random);
        }
        
        //Color correct square green
        SetAllSelectColor("grey");
        SetColor($(".memory-select").eq(boxToSelect[currentBoxToSelect]), "green");
        
        //Add delay to hide green square, and set next square to display
        currentBoxToSelect++;
        setTimeout(SetAllSelectColor, 300, "grey");
        setTimeout(StartDisplay, 400);
    }
    else
    {
        //Done displaying, allow player to select
        currentBoxToSelect = 0;
        SetNextSelect();
        SetTimer(maxBoxToSelect + 5);
    }
}

function SetNextSelect()
{
    //Make all squares selectable, and give class "memory-correct" to correct square
    SetAllSelectColor("blue");
    $(".memory-select").removeClass("memory-correct");
    $(".memory-select").eq(boxToSelect[currentBoxToSelect]).addClass("memory-correct");
    
    select = true;
    currentBoxToSelect++;
}

/*
Clears given button's color class, and set by given color

@param {class} btn - Button class to clear and set color.
@param {string} color - Color to set given button to.
*/
function SetColor(btn, color)
{
    //Remove all class colors button may potentally have
    btn.removeClass("color-background-red");
    btn.removeClass("color-background-green");
    btn.removeClass("color-background-blue");
    btn.removeClass("color-background-grey");
    
    //Set button color to given value
    btn.addClass("color-background-" + color);
}

/*
Clears all button's color class, and set by given color

@param {string} color - Color to set all buttons to.
*/
function SetAllSelectColor(color)
{
    //Reset all square colors and set all square given color
    $(".memory-select").removeClass("color-background-red");
    $(".memory-select").removeClass("color-background-green");
    $(".memory-select").removeClass("color-background-blue");
    $(".memory-select").removeClass("color-background-grey");

    $(".memory-select").addClass("color-background-" + color);
}

/*
Sets time to the timer and start ticking down.

@param {number} newTimer - To set time left.
*/
function SetTimer(newTimer)
{
    //Set given timer and start ticking down
    timer = newTimer;
    DoTimer(timer);
}

/*
Expects to be called every second, process actions on timer tick

@param {number} expectedTimer - Current timer number to check if still ticking down.
*/
function DoTimer(expectedTimer)
{
    //Check if level ended, if so stop continue counting down
    if (timer != expectedTimer || !select)
    {
        return;
    }
    
    //Display timer left
    const mins = Math.floor(timer / 60);
    const seconds = timer % 60;
    
    if (seconds >= 10)
    {
        $("#counter-timer").text(mins + ":" + seconds);
    }
    else
    {
        $("#counter-timer").text(mins + ":0" + seconds);
    }
    
    if (timer > 0)
    {
        //Tick timer down, wait 1 second to tick again
        timer--;
        setTimeout(DoTimer, 1000, timer);
    }
    else
    {
        //Reached 0, end the game
        select = false;
        SetAllSelectColor("grey");
        SetColor($(".memory-correct"), "green");
        
        start = true;
        SetColor($(".memory-start"), "blue");
    }
}