const { File } = require("megajs");
const Cj = require("circular-json");
const fs = require("fs");
const path = require("path");
const express= require("express");
const app = express();
const axios= require("axios");
const FormData=require("form-data");
const BOT_TOKEN = process.env.token;
File.defaultHandleRetries = (tries, error, cb) => {
  if (tries > 8) {
    // Give up after eight retries
    cb(error);
  } else {
    // Wait some time then try again
    setTimeout(cb, 1000 * Math.pow(2, tries));
  }
};


function validateUrl(url){
  const regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;
  return regex.test(url);
}
function exUl(url){
  obb={};
 if(
  url.indexOf("/folder")>=0&&
  url.indexOf("/file")>=0
 ){
   
  }else if(url.indexOf("/folder")>=0&&url.indexOf("/file")==-1){
    splH=url.split("/folder/")[1].split("#");
   obb.folderId=splH[0];
   obb.fkey=splH[1];
  }else if(url.indexOf("/folder")==-1&&url.indexOf("/file")>=0){

  }
  return obb;
  }
const dlp=process.env.downloadPath;
// Get the folder object from the URL
var follf;


async function dl(did,fkey){
  return new Promise(async (res,rej)=>{
    fol = File.fromURL(follf+"/file/"+did[1]);
  await fol.loadAttributes(async (error, ff) => {
    var ffpp=path.join(__dirname,dlp,ff.name);
    Ff=ff;
  console.log("doing: "+ff.name);
  stream= ff.download();
stream.on('progress', info => {
  console.log('Loaded', info.bytesLoaded, 'bytes of', info.bytesTotal);
  if(info.bytesLoaded==info.bytesTotal){
    setTimeout(()=>{
      let start = fs.statSync(ffpp).size;
      if(start<info.bytesLoaded){
      file.download({ start })
  .pipe(fs.createWriteStream(ffpp, {
    flags: 'r+', // <= set flags to prevent overwriting the file
    start
  }));
      }else{
    res(ffpp);
      console.log("dd done");
      }
    },5000);
  }
});
  stream.pipe(
      fs.createWriteStream(
        ffpp
      ));   
  })
  }) 
}


async function dll(did,ull){
  return new Promise(async (res,rej)=>{
    fol = File.fromURL(ull+"/file/"+did);
  await fol.loadAttributes(async (error, ff) => {
    var ffpp=path.join(__dirname,dlp,ff.name);
    Ff=ff;
  console.log("doing: "+ff.name);
  stream= ff.download();
stream.on('progress', info => {
  console.log('Loaded', info.bytesLoaded, 'bytes of', info.bytesTotal);
  if(info.bytesLoaded==info.bytesTotal){
    setTimeout(()=>{
      let start = fs.statSync(ffpp).size;
      if(start<info.bytesLoaded){
      file.download({ start })
  .pipe(fs.createWriteStream(ffpp, {
    flags: 'r+', // <= set flags to prevent overwriting the file
    start
  }));
      }else{
        res(ffpp);
        console.log("dd done");
      }
    },5000);
  }
});
  stream.pipe(
      fs.createWriteStream(
        ffpp
      ));   
  })
  }) 
}



async function sendT(file,res){
        const formData = new FormData();
        formData.append('chat_id', process.env.channel);
        formData.append('document',await fs.createReadStream(path.resolve(file)));
        formData.append('caption', "from megax");
    
        const response = await axios.post(`https://api.telegram.org/bot${BOT_TOKEN}/sendDocument`, formData, {
            headers:{
              'Content-Type': 'multipart/form-data'
            },
            data:formData
        });
        return response.data.ok;
}



async function startS(obj){
  console.log("starting send!!");
  for(i=0;i<obj.files.length;){
    fkey=obj.fkey;
    nn=await dl(obj.files[i].did,fkey);
    console.log("downloaded "+nn);
    if(nn!=null){
      cv=await sendT(nn);
      console.log("send done "+cv);
      if(cv){
        fs
          .unlinkSync(
            path.resolve(nn));
        console.log("deleted "+nn);
        if(i==(obj.files.length-1)){
          runner();
        }else{
          i++;
        }
      }
    }
  }
  
}

async function sendM(msg){
  x=await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage?chat_id=${process.env.channel}&text=${msg}&parse_mode=html`);
  return x.ok;
}

async function loadMega(url) {
  exobj=await exUl(url);
  console.log(exobj);
  follf=url;
  const folder = File.fromURL(url);
  obj={files:[]};
  await folder.loadAttributes();
  if(folder.directory==true){
    obj.folder=true;
    obj.name=folder.name;
    obj.url=url;
      for (file of folder.children) {
      console.log("doing: " + file.name);
      if (file.directory == false) {
        obj.files.push({
          did:file.downloadId,
          key:file.key,
          name:file.name
        });
        console.log(
          file.downloadId,
          file.key
        );
      }else{
      console.log("folder: "+file.name);
      for(inf of file.children){
          if(inf.directory == false){     
            obj.files.push({
            did:inf.downloadId,
            key:inf.key,
            name:inf.name
            });
         }else{
          console.log("folder: "+inf.name);
           for(iinf of inf.children){
             if(iinf.directory == false){
               //down f
               if(iinf.key!=null){
                 obj.files.push({
                 did:iinf.downloadId,
                 key:iinf.key,
                 name:iinf.name
                 });
               }
             }
           }     
      }
     }
    }
    }
  }else{
    obj.folder=false;
    obj.name=folder.name;
    obj.url=url;
    obj.files.push({
      did:folder.downloadId,
      key:folder.key,
      name:folder.name
    })
  }
  obj.fkey=exobj.fkey;
  fs.writeFileSync(
    "files.json",
    JSON.stringify(obj)
  );
  console.log(obj.files.length+" of files founded!");
  await sendM(obj.files.length+" of files founded from "+url);
 await startS(obj);
 return obj;
}


app.use(express.static("download"));
app.get("/",(req,res)=>{
  res.send("Hello World");
});



async function runner(){
  fiT=await fs.readFileSync(path.join(__dirname,"Task.json"));
  Aj=JSON.parse(fiT).task;
  nc=Aj.length;
  if(nc>=1){
    nt=Aj.pop();
    await loadMega(nt);
  }else{
    console.log("No tasks");
    setTimeout(runner,3000);
    
  }
}

app.get("/run",(req,res)=>{
  runner();
})

app.get("/tg",(req,res)=>{
  var url,pw;
  console.log(req.query);
  if(req.query.url!=null&&req.query.pw!=null){
    url=req.query.url.replace("***","#");
    pw=req.query.pw;
    if(validateUrl(url)){
      if(pw==process.env.pw){
        taskArj=fs
          .readFileSync("Task.json");
        taskAr=JSON.parse(taskArj).task;
        if(taskAr.indexOf(url)==-1){
          taskAr.push(url);
          fs.writeFileSync(
            "Task.json",
            JSON.stringify({task:taskAr})
          );
          res.status(200).send("ok");
        }else{
          res.status(201).send(
            "already had the task!"
          );
        }
      }else{
        res.status(400).send("wrong password");
      }
    }else{
      res.status(202).send("invalid url");
    }
  }else{
    res.status(404).send(
      "missing url or password"
    );
  }

})

app.get("/sendF",async (req,res)=>{
   if(req.query.url!=null&&req.query.id!=null){
      url=req.query.url.replace("***","#");
      id=req.query.id;
      dalp=await dll(id,url);
    if(dalp!=null){
      cv=await sendT(dalp);
      console.log("send done "+cv);
      if(cv){
        fs
          .unlinkSync(
            path.resolve(nn));
        console.log("deleted "+nn);
        res.send(JSON.stringify({
            ok:true,
            m:"file was sent"
             }));
      }else{
        res.send(JSON.stringify({
            ok:false,
            m:"file cant send"
             }))
      }
    }else{
      res.send(JSON.stringify({
            ok:false,
            m:"file cant download"
             }));
    }  
   }else{
      res.send(
        JSON.stringify({
          ok:false,
          m:"cannot find parameters"
        }));
   }

})

app.get("/mega",async (req,res)=>{
   if(req.query.url!=null){
      var url=req.query.url;
      if(validateUrl(url)){
        cc=await loadMega(url);
        cc.ok=true;
        res.send(
          JSON.stringify(cc)
        );
      }else{
        res.send(
          JSON.stringify({
            ok:false,
            m:"not valid url"
          }));
      }
   }else{
     res.send(JSON.stringify({ok:false,m:"no url"});
   }
});


app.listen(3000,()=>{
  console.log("server started");
   fs.writeFileSync("Task.json",JSON.stringify({task:[]}));
  //runner();
  //https://mega.nz/folder/RPNFhYaC#XWhiKlEgR4BwCzrMQmqizw
  //loadMega();
})