const fs = require('fs');

var files = {};

let uploadPoicess = function uploadProcess(socket){
    socket.on('Start', (data) => {
        let fileName = data['fileName'];

        files[fileName] = {  
            fileSize : data['size'],
            data     : "",
            downloaded : 0
        }

        let startingRange = 0;
        try{
            let stats = fs.statSync('Temp/' +  fileName);
            if(stats.isFile())
            {
                files[fileName]['downloaded'] = stats.size;
                startingRange = stats.size / 5000000;
            }
        }
        catch(er){} //It's a New File
        fs.open("Temp/" + fileName, "a", 0755,(err, fd) => {
            if(err)
            {
                console.log(err);
            }
            else
            {
                files[fileName]['handler'] = fd; //We store the file handler so we can write to it later
                socket.emit('MoreData', { 'startingRange' : startingRange, percent : 0 });
            }
        });
    });

    socket.on('Upload', (data) => {
        let fileName = data['fileName'];
        files[fileName]['downloaded'] += data['data'].length;
        files[fileName]['data'] += data['data'];

        if(files[fileName]['downloaded'] == files[fileName]['fileSize']) //If File is Fully Uploaded
        {
            fs.write(files[fileName]['handler'], files[fileName]['data'], null, 'Binary', (err, Writen) => {
                let inp = fs.createReadStream("Temp/" + fileName);
                let out = fs.createWriteStream("Video/" + fileName);
                inp.pipe(out);
                inp.on('end', ()=>{
                    fs.unlink("Temp/" + fileName, () => { //This Deletes The Temporary File
                        //Moving File Completed
                        files = {};
                        socket.emit('Done',{});
                    });
                })
            });
        }
        else if(files[fileName]['data'].length > 10485760){ //If the data Buffer reaches 10MB
            fs.write(files[fileName]['handler'], files[fileName]['data'], null, 'Binary',(err, Writen) => {
                files[fileName]['data'] = ""; //Reset The Buffer
                let startingRange = files[fileName]['downloaded'] / 5000000;
                let percent = (files[fileName]['downloaded'] / files[fileName]['fileSize']) * 100;
                socket.emit('MoreData', { 'startingRange' : startingRange, 'percent' :  percent});
            });
        }
        else
        {
            let startingRange = files[fileName]['downloaded'] / 5000000;
            let percent = (files[fileName]['downloaded'] / files[fileName]['fileSize']) * 100;
            socket.emit('MoreData', { 'startingRange' : startingRange, 'percent' :  percent});
        }
    });
}

module.exports = uploadPoicess;