const http = require("http");
const fs = require("fs");
var requests = require("requests");
var url = require('url');

const homeFile = fs.readFileSync("home.html", "utf-8");

const replaceVal = (tempVal, orgVal) => {
  let temperature = tempVal.replace("{%tempval%}", orgVal.main.temp);
  temperature = temperature.replace("{%tempmin%}", orgVal.main.temp_min);
  temperature = temperature.replace("{%tempmax%}", orgVal.main.temp_max);
  temperature = temperature.replace("{%location%}", orgVal.name);
  temperature = temperature.replace("{%country%}", orgVal.sys.country);
  temperature = temperature.replace("{%tempstatus%}", orgVal.weather[0].main);

  return temperature;
};

const server = http.createServer((req, res) => {

  var q = url.parse(req.url, true);
  const  str=q.path;

  const s=str.substring(1);
  if(s==''){
    res.end("please write City name");
  }
  else if (s!="favicon.ico") {
    requests(
      `http://api.openweathermap.org/data/2.5/weather?q=${s}&units=metric&appid=f359d829f6c01a8461efe433502e8986`
    )
      .on("data", (chunk) => {
        const objdata = JSON.parse(chunk);
        
        const arrData = [objdata];
        // console.log(arrData[0].main.temp);
        // console.log(arrData[0].message);

        if((arrData[0].message=="city not found")){
              res.end("City not found");
        }
        else{
        const realTimeData = arrData
          .map((val) => replaceVal(homeFile, val))
          .join("");
        res.write(realTimeData);
        // console.log(realTimeData);
        }
        
      })
      .on("end", (err) => {
        if (err) return console.log("connection closed due to errors", err);
        res.end();
      });
    
  } else {
    res.end("File not found");
  }
});

server.listen(8000, "127.0.0.1");

