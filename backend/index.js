import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import {fileURLToPath} from 'url';
import DB from './db/client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log(__filename,__dirname);

dotenv.config({
    path: './backend/.env'
});

const appHost = process.env.APP_HOST;
const appPort = process.env.APP_PORT;

const app = express();
const db = new DB();

app.options("/*", function(req, res, next){
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,PATCH,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.send(200);
  });




//logging middleware
app.use('*',(req,res,next)=>{
    if(req.method!='GET'){
        console.log(
            req.method,
            req.baseUrl || req.url,
            new Date().toISOString()
        );
    }
    next();
})

app.all('/*', function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With");
    next();
  });

//middleware for static app files
app.use('/',express.static(path.resolve(__dirname,'../dist')));

//get all
app.get('/pack',async(req,res)=>{
    try{
        const [dbSpecialists,dbApplicants,dbSkills] = await Promise.all([
            db.getSpecialists(),
            db.getApplicants(),
            db.getSkills()]);
        
        const specialists = dbSpecialists.map((
            {id,name,start_time,end_time,applicants,skills})=>({
            specialistID:id,name,start_time,end_time,applicants,skills}));
        const applicants = dbApplicants.map((
            {id,name,arrival_time,specialist_id,skills})=>({
            applicantID:id,name,arrival_time,specialistID:specialist_id,skills}));
        const skills = dbSkills.map((
            {id,name})=>({
            skillID:id,name}));

        res.statusCode = 200;
        res.statusMessage='OK';
        res.json({specialists:specialists, 
            applicants:applicants, 
            skills:skills});
    }catch(err){
        res.statusCode=500;
        res.statusMessage='Internal server error';
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: 500,
            message: `Getting pack error: ${err.error.message||err.error}`
        })
    }
});


// body parsing middleware
//app.use('/specialists',express.json());

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(express.json()); // <--- Here
app.use(express.urlencoded({extended: true}));


//add specialist
app.post('/specialists', async (req,res)=>{
    try{
        console.log(req.body);
        const {specialistID,name,start_time,end_time}=req.body;
        await db.addSpecialist({specialistID,name,start_time,end_time});
        res.statusCode = 200;
        res.statusMessage='OK';
        res.send();
    }
    catch(err){
        switch(err.type){
            case 'client':
                res.statusCode=500;
                res.statusMessage='Bad request';
                break;
            default:
                res.statusCode=500;
                res.statusMessage='Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Add specialist error: ${err.error.message||err.error}`
        })
    }
});

//add applicant
app.use('/applicants',express.json());
app.post('/applicants', async (req,res)=>{
    try{
        const {applicantID,name,arrival_time}=req.body;
        await db.addApplicant({applicantID,name,arrival_time});
        res.statusCode = 200;
        res.statusMessage='OK';
        res.send();
    }
    catch(err){
        switch(err.type){
            case 'client':
                res.statusCode=500;
                res.statusMessage='Bad request';
                break;
            default:
                res.statusCode=500;
                res.statusMessage='Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Add applicant error: ${err.error.message||err.error}`
        })
    }
});

//add skill
app.use('/skills',express.json());
app.post('/skills', async (req,res)=>{
    try{
        const {skillID,name}=req.body;
        await db.addSkill({skillID,name});
        res.statusCode = 200;
        res.statusMessage='OK';
        res.send();
    }
    catch(err){
        switch(err.type){
            case 'client':
                res.statusCode=500;
                res.statusMessage='Bad request';
                break;
            default:
                res.statusCode=500;
                res.statusMessage='Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Add skill error: ${err.error.message||err.error}`
        })
    }
});


//edit specialist
app.use('/specialists/:specialistID',express.json());
app.patch('/specialists/:specialistID',async (req,res)=>{
    try{
        const {specialistID} =req.params;
        const {name,start_time,end_time}=req.body;
        await db.updateSpecialist({specialistID,name,start_time,end_time});
        res.statusCode = 200;
        res.statusMessage='OK';
        res.send();
    }
    catch(err){
        switch(err.type){
            case 'client':
                res.statusCode=500;
                res.statusMessage='Bad request';
                break;
            default:
                res.statusCode=500;
                res.statusMessage='Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Update specialist error: ${err.error.message||err.error}`
        })
    }
});

//edit applicant
app.use('/applicants/:applicantID',express.json());
app.patch('/applicants/:applicantID',async (req,res)=>{
    try{
        const {applicantID} =req.params;
        const {name,arrival_time}=req.body;
        await db.updateApplicant({applicantID,name,arrival_time})
        res.statusCode = 200;
        res.statusMessage='OK';
        res.send();
    }
    catch(err){
        switch(err.type){
            case 'client':
                res.statusCode=500;
                res.statusMessage='Bad request';
                break;
            default:
                res.statusCode=500;
                res.statusMessage='Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Update applicant error: ${err.error.message||err.error}`
        })
    }
});

//delete specialist
app.delete('/specialists/:specialistID',async (req,res)=>{
    try{
        const {specialistID} =req.params;
        await db.deleteSpecialist({specialistID});
        res.statusCode = 200;
        res.statusMessage='OK';
        res.send();
    }
    catch(err){
        switch(err.type){
            case 'client':
                res.statusCode=500;
                res.statusMessage='Bad request';
                break;
            default:
                res.statusCode=500;
                res.statusMessage='Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Delete specialist error: ${err.error.message||err.error}`
        })
    }
});
//delete applicant
app.delete('/applicants/:applicantID',async (req,res)=>{
    try{
        const {applicantID} =req.params;
        await db.deleteApplicant({applicantID});
        res.statusCode = 200;
        res.statusMessage='OK';
        res.send();
    }
    catch(err){
        switch(err.type){
            case 'client':
                res.statusCode=500;
                res.statusMessage='Bad request';
                break;
            default:
                res.statusCode=500;
                res.statusMessage='Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Delete applicant error: ${err.error.message||err.error}`
        })
    }
});

//delete skill
app.use('/skills/:skillID',express.json());
app.delete('/skills/:skillID',async (req,res)=>{
    try{
        const {skillID} = req.params;
        await db.deleteSkill({skillID});
        res.statusCode = 200;
        res.statusMessage='OK';
        res.send();
    }
    catch(err){
        switch(err.type){
            case 'client':
                res.statusCode=500;
                res.statusMessage='Bad request';
                break;
            default:
                res.statusCode=500;
                res.statusMessage='Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Delete skill error: ${err.error.message||err.error}`
        })
    }
});

//bind applicant to specialist
app.use('/bind',express.json());
app.patch('/bind',async (req,res)=>{
    try{
        const {applicantID,specialistID}=req.body;
        await db.bindApplicantToSpecialist({applicantID,specialistID})
        res.statusCode = 200;
        res.statusMessage='OK';
        res.send();
    }
    catch(err){
        switch(err.type){
            case 'client':
                res.statusCode=500;
                res.statusMessage='Bad request';
                break;
            default:
                res.statusCode=500;
                res.statusMessage='Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `bind applicant to specialist error: ${err.error.message||err.error}`
        })
    }
});

//add skill to specialist
app.use('/skills/specialist/',express.json());
app.patch('/skills/specialist/',async (req,res)=>{
    try{
        const {skillID,specialistID}=req.body;
        await db.addSkillToSpecialist({skillID,specialistID});
        res.statusCode = 200;
        res.statusMessage='OK';
        res.send();
    }
    catch(err){
        switch(err.type){
            case 'client':
                res.statusCode=500;
                res.statusMessage='Bad request';
                break;
            default:
                res.statusCode=500;
                res.statusMessage='Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `add skill to specialist error: ${err.error.message||err.error}`
        })
    }
});

//add skill to applicant
app.use('/skills/applicant/',express.json());
app.patch('/skills/applicant/',async (req,res)=>{
    try{
        const {skillID,applicantID}=req.body;
        await db.addSkillToApplicant({skillID,applicantID});
        res.statusCode = 200;
        res.statusMessage='OK';
        res.send();
    }
    catch(err){
        switch(err.type){
            case 'client':
                res.statusCode=500;
                res.statusMessage='Bad request';
                break;
            default:
                res.statusCode=500;
                res.statusMessage='Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `add skill to applicant error: ${err.error.message||err.error}`
        })
    }
});

//reset specialist skill
app.use('/skills/specialist/:specialistID',express.json())
app.delete('/skills/specialist/:specialistID',async (req,res)=>{
    try{
        const {specialistID} = req.params;
        await db.resetSpecialistSkills({specialistID});
        res.statusCode = 200;
        res.statusMessage='OK';
        res.send();
    }
    catch(err){
        switch(err.type){
            case 'client':
                res.statusCode=500;
                res.statusMessage='Bad request';
                break;
            default:
                res.statusCode=500;
                res.statusMessage='Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Reset specialist skills error: ${err.error.message||err.error}`
        })
    }
});

//reset applicant skill
app.use('/skills/applicant/:applicantID',express.json())
app.delete('/skills/applicant/:applicantID',async (req,res)=>{
    try{
        const {applicantID} = req.params;
        await db.resetApplicantSkills({applicantID});
        res.statusCode = 200;
        res.statusMessage='OK';
        res.send();
    }
    catch(err){
        switch(err.type){
            case 'client':
                res.statusCode=500;
                res.statusMessage='Bad request';
                break;
            default:
                res.statusCode=500;
                res.statusMessage='Internal server error';
        }
        res.json({
            timestamp: new Date().toISOString(),
            statusCode: res.statusCode,
            message: `Reset applicant skills error: ${err.error.message||err.error}`
        })
    }
});


const server = app.listen(Number(appPort),appHost, async ()=>{
    try{
        await db.connect();
    }catch(error){ 
        console.log('HR manager app shut down');
        process.exit(100);
    }
    console.log(`HR manager app started at host http://${appHost}:${appPort}`);
    
    console.log(await db.getApplicants());
    console.log(await db.getSpecialists());
    console.log(await db.getSkills());
});

process.on('SIGTERM',()=>{
    console.log('SIGTER signal recieved: closing HTTP server');
    server.close(async ()=>{
        await db.disconnect();
        console.log('HTTP server closed');
    })


});