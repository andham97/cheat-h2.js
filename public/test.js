today = new Date();

BigDay = new Date("December 25, 2025");
msPerDay = 24 * 60 * 60 * 1000 ;
timeLeft = (BigDay.getTime() - today.getTime());
e_daysLeft = timeLeft / msPerDay;
daysLeft = Math.floor(e_daysLeft);
e_hrsLeft = (e_daysLeft - daysLeft)*24;
hrsLeft = Math.floor(e_hrsLeft);
minsLeft = Math.floor((e_hrsLeft - hrsLeft)*60);

document.write("<p>There are only<b>" + daysLeft + " days " + hrsLeft +" hours and " + minsLeft + " minutes left </b> Until December 25th 2025</p>");
