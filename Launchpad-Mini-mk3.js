// location for midi notes
var buttonNotes = [
	[91, 92, 93, 94, 95, 96, 97, 98, 99],
	[81, 82, 83, 84, 85, 86, 87, 88, 89],
	[71, 72, 73, 74, 75, 76, 77, 78, 79],
	[61, 62, 63, 64, 65, 66, 67, 68, 69],
	[51, 52, 53, 54, 55, 56, 57, 58, 59],
	[41, 42, 43, 44, 45, 46, 47, 48, 49],
	[31, 32, 33, 34, 35, 36, 37, 38, 39],
	[21, 22, 23, 24, 25, 26, 27, 28, 29],
	[11, 12, 13, 14, 15, 16, 17, 18, 19]
	];

var buttonValueObj = [];



// ---- Midi Functions ----

function setMidiMode()
{
	local.sendSysex(0x00, 0x20, 0x29, 0x02, 0x0D, 0x0E, 0x01);
	script.log("Set Midi Mode with Sysex Message");
}


function setButtonColor(id, color)
{
	var index = buttonNotes[id[0]][id[1]];
	var r = Math.round(color[0] * 127);
	var g = Math.round(color[1] * 127);
	var b = Math.round(color[2] * 127);

	script.log("Set Color for note "+index+" to rgb:{"+r+","+g+","+b+"}");
	local.sendSysex(0x00, 0x20, 0x29, 0x02, 0x0D, 0x03, 0x03, index, r, g, b);
}



// ---- Helper Functions ----

function getButtonForNote(note) {
	for (var i = 0; i < 9; i++)
	{
		if (buttonNotes[i].contains(note))
		{
			return buttonValueObj[i][(buttonNotes[i].indexOf(note))]; //+1
		}
	}
	return null;
    // if (buttonNotes.contains(note)) return buttonValueObj[buttonNotes.indexOf(note)];
}


function resendColors()
{
	//FIXME
	local.parameters.colors.topButtons.map(moduleParameterChanged);
	return;
	// var colorContainers = local.parameters.colors;
	// for (var container in colorContainers)
	// {
	// 	for (var param in container)
	// 	{
	// 		moduleParameterChanged(param);
	// 	}
	// }

	// return;
	// for(var i=0; i<9; i++)
	// {
	// 	for(var j=0; j<9; j++)
	// 	{
	// 		colorPararm = 
	// 		setButtonColor()
	// 	}
	// }
}



// ---- Module Common Functions ----

function init()
{
	script.log("Setting up Launchpad Mini mk3");

	// init variable
	for (var i = 0; i < 9; i++) 
	{
		buttonValueObj[i] = [];
	}

	// Top Buttons
    for (var i = 0; i < 8; i++) 
	{
        buttonValueObj[0][i] = local.values.getChild("Top Buttons").getChild("topButton" + (i + 1) + "");
    }

	// Main Buttons
    for (var i = 0; i < 8; i++) 
	{
		for (var j = 0; j < 8; j++) 
		{
			buttonValueObj[i+1][j] = local.values.getChild("Main Buttons").getChild("button" + (i + 1) + (j + 1) + "");
		}
    }

	// Side Buttons
    for (var i = 0; i < 8; i++) 
	{
        buttonValueObj[i+1][8] = local.values.getChild("Side Buttons").getChild("sideButton" + (i + 1));
    }

	// Setup Mode and Colors
	setMidiMode();
	resendColors();
}


function moduleParameterChanged(param)
{
	// Debugging 
	script.log(param.name + " parameter changed, new value: " + param.get());

	// Connection
    if (param.name == "isConnected")
	{
        if (param.get() == 1)
		{
			util.delayThreadMS(3000);
			setMidiMode();
		} 
		resendColors();
    }


	// Color Feedback
	if(param.getParent().getParent().name == "colors")
	{
		var color = param.get();

		if(param.name == "logo")
		{
			var id = [0, 8];
			setButtonColor(id, color);
		}
		else if(param.getParent().name == "topButtons")
		{
			var id = [0, (parseInt(param.name.charAt(9))-1)];
			setButtonColor(id, color);
		}
		else if(param.getParent().name == "mainButtons")
		{
			var id = [(parseInt(param.name.charAt(6))), (parseInt(param.name.charAt(7))-1)];
			setButtonColor(id, color);
		}
		else if(param.getParent().name == "sideButtons")
		{
			var id = [parseInt(param.name.charAt(10)), 8];
			setButtonColor(id, color);
		}
	}
}


function noteOnEvent(channel, note, velocity)
{
	var button = getButtonForNote(note);
	if (!!button)
	{
		button.set((velocity==127));
	}
}


function noteOffEvent(channel, note, velocity)
{
	var button = getButtonForNote(note);
	if (!!button)
	{
		button.set(false);
	}
}


function ccEvent(channel, note, value)
{
	var button = getButtonForNote(note);
	if (!!button)
	{
		button.set((value==127));
	}
}


function sysExEvent(data)
{
	script.log("Sysex Message received, "+data.length+" bytes :");
}