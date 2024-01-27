import pg from 'pg';

export default class DB{
    #dbClient = null;
    #dbHost = '';
    #dbPort = '';
    #dbName = '';
    #dbLogin= '';
    #dbPassword= '';

    constructor(){
        this.#dbHost = process.env.DB_HOST;
        this.#dbPort = process.env.DB_PORT;
        this.#dbName = process.env.DB_NAME;
        this.#dbLogin= process.env.DB_LOGIN;
        this.#dbPassword= process.env.DB_PASSWORD;

        this.#dbClient=new pg.Client({
            user:this.#dbLogin,
            password:this.#dbPassword,
            host:this.#dbHost,
            port:this.#dbPort,
            database:this.#dbName
        });
    }

    async connect(){
        try {
            await this.#dbClient.connect();
            console.log('DB connection established');
        } catch(error){
            console.error('Unable to connect to DB: ',error);
            return Promise.reject(error);
        }
    }

    async disconnect(){
        await this.#dbClient.end();
        console.log('DB connection was closed');
    }

    async getSpecialists() {
        try {
            const specialists = await this.#dbClient.query(
                'SELECT * FROM specialists ORDER BY start_time,name;'
            );
            return specialists.rows;
        }
        catch(error){
            console.log('unable to get specialists,error: ',error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async getApplicants() {
        try {
            const applicants = await this.#dbClient.query(
                'SELECT * FROM applicants ORDER BY arrival_time;'
            );
            return applicants.rows;
        }
        catch(error){
            console.log('unable to get applicants,error: ',error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async getSkills() {
        try {
            const skills = await this.#dbClient.query(
                'SELECT * FROM skills;'
            );
            return skills.rows;
        }
        catch(error){
            console.log('unable to get skills, error: ',error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async addSpecialist({specialistID,name,start_time='00:00:00',end_time='23:59:59'}={
        specialistID:null,name: '',start_time:'00:00:00',end_time:'23:59:59'
    }){
        if(!specialistID || !name ){
            const errMsg = `Add specialist error: 
                wrong params (specialistID: ${specialistID}, name: ${name}, 
                start_time: ${start_time}, end_time: ${end_time})`;
            console.error(errMsg);
            return Promise.reject({
                type:'client',
                error: new Error(errMsg)
            });
        }
        try {
            await this.#dbClient.query(
                'INSERT INTO specialists (id,name,start_time,end_time) VALUES ($1,$2,$3,$4);',
                [specialistID,name,start_time,end_time]
            );
        }
        catch(error){
            console.log('unable to add specialist, error: ',error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async addApplicant({applicantID,name,arrival_time='00:00:00'}={
        applicantID:null,name: '',arrival_time:'00:00:00'
    }){
        if(!applicantID || !name ){
            const errMsg = `Add applicant error: 
                wrong params (applicantID: ${applicantID}, name: ${name}, 
                arrival_time: ${arrival_time})`;
            console.error(errMsg);
            return Promise.reject({
                type:'client',
                error: new Error(errMsg)
            });
        }
        try {
            await this.#dbClient.query(
                'INSERT INTO applicants (id,name,arrival_time) VALUES ($1,$2,$3);',
                [applicantID,name,arrival_time]
            );
        }
        catch(error){
            console.log('unable to add applicant, error: ',error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async addSkill({skillID,name}={
        skillID:null,name: ''
    }){
        if(!skillID || !name ){
            const errMsg = `Add skill error: 
                wrong params (skillID: ${skillID}, name: ${name}, )`;
            console.error(errMsg);
            return Promise.reject({
                type:'client',
                error: new Error(errMsg)
            });
        }
        try {
            await this.#dbClient.query(
                'INSERT INTO skills (id,name) VALUES ($1,$2);',
                [skillID,name]
            );
        }
        catch(error){
            console.log('unable to add skill, error: ',error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async updateSpecialist({specialistID,name,start_time='00:00:00',end_time='23:59:59'}={
        specialistID:null,name: '',start_time:'00:00:00',end_time:'23:59:59'
    }){
        if(!specialistID || !name || !start_time || !end_time){
            const errMsg = `update specialist error: 
                wrong params (specialistID: ${specialistID}, name: ${name}, 
                start_time: ${start_time}, end_time: ${end_time})`;
            console.error(errMsg);
            return Promise.reject({
                type:'client',
                error: new Error(errMsg)
            });
        }

        try {
            await this.#dbClient.query(
                'UPDATE specialists SET name= $2, start_time=$3, end_time=$4 WHERE id= $1;',
                [specialistID,name,start_time,end_time]
            );
        }
        catch(error){
            console.log('unable to update specialist, error: ',error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async updateApplicant({applicantID,name,arrival_time='00:00:00'}={
        applicantID:null,name: '',arrival_time:'00:00:00'
    }){
        if(!applicantID || !name || !arrival_time){
            const errMsg = `update applicant error: 
                wrong params (applicantID: ${applicantID}, name: ${name}, 
                    arrival_time: ${arrival_time})`;
            console.error(errMsg);
            return Promise.reject({
                type:'client',
                error: new Error(errMsg)
            });
        }

        try {
            await this.#dbClient.query(
                'UPDATE applicants SET name= $2, arrival_time=$3 WHERE id= $1;',
                [applicantID,name,arrival_time]
            );
        }
        catch(error){
            console.log('unable to update applicant, error: ',error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async deleteSpecialist({specialistID}={specialistID:null})
    {
        if(!specialistID){
            const errMsg = `delete specialist error: 
                wrong params (specialistID: ${specialistID})`;
            console.error(errMsg);
            return Promise.reject({
                type:'client',
                error: new Error(errMsg)
            });
        }
        try {
            await this.#dbClient.query(
                'UPDATE applicants SET specialist_id=NULL WHERE specialist_id=$1;',
                [specialistID]
            );
            await this.#dbClient.query(
                'DELETE FROM specialists WHERE id=$1;',
                [specialistID]
            );

        }
        catch(error){
            console.log('unable to delete specialit, error: ',error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }
    
    async deleteApplicant({applicantID}={
        applicantID:null
    }){
        if(!applicantID){
            const errMsg = `delete applicant error: 
                wrong params (applicantID: ${applicantID})`;
            console.error(errMsg);
            return Promise.reject({
                type:'client',
                error: new Error(errMsg)
            });
        }
        try {
            await this.#dbClient.query(
                'UPDATE specialists SET applicants = array_remove(applicants,$1);',
                [applicantID]
            );
            await this.#dbClient.query(
                'DELETE FROM applicants WHERE id=$1;',
                [applicantID]
            );

        }
        catch(error){
            console.log('unable to delete applicant, error: ',error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async deleteSkill({skillID}={id:null}){
        if(!skillID){
            const errMsg = `delete skill error: 
                wrong params (skillID: ${skillID})`;
            console.error(errMsg);
            return Promise.reject({
                type:'client',
                error: new Error(errMsg)
            });
        }
        try {
            await this.#dbClient.query(
                'UPDATE specialists SET skills = array_remove(skills,$1);',
                [skillID]
            );
            await this.#dbClient.query(
                'UPDATE applicants SET skills = array_remove(skills,$1);',
                [skillID]
            );
            await this.#dbClient.query(
                'DELETE FROM skills WHERE id=$1;',
                [skillID]
            );

        }
        catch(error){
            console.log('unable to delete skill, error: ',error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }


    async bindApplicantToSpecialist({applicantID,specialistID}={applicantID:null,specialistID:null}){
        if(!applicantID || ! specialistID){
            const errMsg = `bind applicant to specialist error: 
                wrong params (Applicant id: ${applicantID}, Specialist id: ${specialistID})`;
            console.error(errMsg);
            return Promise.reject({
                type:'client',
                error: new Error(errMsg)
            });
        }
        try {
            await this.#dbClient.query(
                'UPDATE specialists SET applicants = array_remove(applicants,$1);',
                [applicantID]
            );
            await this.#dbClient.query(
                'UPDATE applicants SET specialist_id = $2 WHERE id =$1;',
                [applicantID,specialistID]
            );
            await this.#dbClient.query(
                'UPDATE specialists SET applicants = array_append(applicants,$1) WHERE id = $2;',
                [applicantID,specialistID]
            );

        }
        catch(error){
            console.log('unable to bind applicant to specialist, error: ',error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }
    
    async addSkillToSpecialist({skillID,specialistID}={skillID:null,specialistID:null}){
        if(!skillID || ! specialistID){
            const errMsg = `add skill to specialist error: 
                wrong params (Skill id: ${skillID}, Specialist id: ${specialistID})`;
            console.error(errMsg);
            return Promise.reject({
                type:'client',
                error: new Error(errMsg)
            });
        }
        try {
            await this.#dbClient.query(
                'UPDATE specialists SET skills = array_append(skills, $1) WHERE id = $2;',
                [skillID,specialistID]
            );
        }
        catch(error){
            console.log('unable to add skill to specialist, error: ',error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    async addSkillToApplicant({skillID,applicantID}={skillID:null,applicantID:null}){
        if(!skillID || ! applicantID){
            const errMsg = `add skill to applicant error: 
                wrong params (Skill id: ${skillID}, Applicant id: ${applicantID})`;
            console.error(errMsg);
            return Promise.reject({
                type:'client',
                error: new Error(errMsg)
            });
        }
        try {
            await this.#dbClient.query(
                'UPDATE applicants SET skills = array_append(skills, $1) WHERE id = $2;',
                [skillID,applicantID]
            );
        }
        catch(error){
            console.log('unable to add skill to applicant, error: ',error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }

    
    //resetSpecialistSkills
    async resetSpecialistSkills({specialistID}={specialistID:null}){
        if(!specialistID){
            const errMsg = `reset Specialist skills error: 
                wrong params (specialistID: ${specialistID})`;
            console.error(errMsg);
            return Promise.reject({
                type:'client',
                error: new Error(errMsg)
            });
        }
        try {
            await this.#dbClient.query(
                'UPDATE specialists SET skills=array[]::uuid[] WHERE id = $1;',
                [specialistID]
            );

        }
        catch(error){
            console.log('unable to reset Specialist skills, error: ',error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }
    //resetApplicantSkills
    async resetApplicantSkills({applicantID}={id:null}){
        if(!applicantID){
            const errMsg = `reset Applicant skills error: 
                wrong params (applicantID: ${applicantID})`;
            console.error(errMsg);
            return Promise.reject({
                type:'client',
                error: new Error(errMsg)
            });
        }
        try {
            await this.#dbClient.query(
                'UPDATE applicants SET skills=array[]::uuid[] WHERE id = $1;',
                [applicantID]
            );

        }
        catch(error){
            console.log('unable to reset Applicant skills, error: ',error);
            return Promise.reject({
                type: 'internal',
                error
            });
        }
    }
};