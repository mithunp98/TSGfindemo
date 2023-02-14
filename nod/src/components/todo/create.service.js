const bcrypt = require('bcryptjs');
const { User } = require('../../db/models');
const mysql = require('mysql2');

const db = require('../../db/db.js');
const { BadRequestError, NotFoundError } = require('../../utils/api-errors');
const { create } = require('../../middlewares');
const logger = require('../../support/logger');

const CreateService = {
  /**
   * Login a user and generate token.
   * @async
   * @method
   * @param {UserDto} requestBody - Request Body
   * @returns {Context} Context object
   * @throws {NotFoundError} When the user is not found.
   */

  //ADD TASK
  doCreate: async (requestBody) => {
    try {
      // Destructure the task details from the request body
      const {
        tasktitle,
        taskdescription,
        taskstartdatetime,
        taskenddatetime,
        tasktypetitle,
        prioritytype,
        statustitle,
        userId
      } = requestBody;

      const startDateTime = taskstartdatetime.split('T');
      const startDate = startDateTime[0];
      console.log(startDate);
      const startTime = startDateTime[1] ? startDateTime[1].substring(0, 8) : '';
      console.log(startTime);

      const endDateTime = taskenddatetime.split('T');
      const endDate = endDateTime[0];
      console.log(endDate);
      const endTime = endDateTime[1] ? endDateTime[1].substring(0, 8) : '';

      let checkUsernameQuery = `SELECT * FROM userdetails WHERE uid = '${userId}';`;
      const checkUsernameResult = await db.promise(checkUsernameQuery);

      // If the username exists, insert the task data into the tasklist table
      if (checkUsernameResult.length > 0) {
        // const loacalUsername = sessionStorage.getItem(data.data.username);
        let insertQuery = `INSERT INTO tasklist (tasktitle, taskdescription, taskstartdatetime, taskenddatetime, tasktypeid, priorityid, statusid, uid)
          SELECT '${tasktitle}', '${taskdescription}', '${startDate} ${startTime}', '${endDate} ${endTime}', tasktypeid, priorityid, statusid, uid
          FROM tasktype, priority, statusdetails, userdetails
          WHERE tasktype.tasktypetitle = '${tasktypetitle}'
          AND priority.prioritytype = '${prioritytype}'
          AND statusdetails.statustitle = '${statustitle}'
          AND userdetails.uid = '${userId}'`;
        console.log(insertQuery);

        await db.promise(insertQuery);
      }

      // Select all tasks from the tasklist table
      let selectQuery = `SELECT * FROM tasklist;`;
      const selectResult = await db.promise(selectQuery);
      console.log('selectResult', selectResult);

      return selectResult;
    } catch (error) {
      // Throw an InternalServerError if something goes wrong
      // throw new Error('An error occured while creating the task');
      logger.error(error);
    }
  },

  //VIEW ALL TASK OF A PARTICULAR USER
  doView: async (requestBody) => {
    console.log('requestBody', requestBody);
    let id = requestBody.userId;
    try {
      // SQL query to select all tasks from the tasklist table of a particular user
      let queryObj = `SELECT tasklist.taskid, tasklist.tasktitle, tasklist.taskdescription, tasklist.taskstartdatetime, tasklist.taskenddatetime, tasktype.tasktypetitle, priority.prioritytype, statusdetails.statustitle 
        FROM tasklist 
        INNER JOIN tasktype ON tasklist.tasktypeid = tasktype.tasktypeid 
        INNER JOIN priority ON tasklist.priorityid = priority.priorityid 
        INNER JOIN statusdetails ON tasklist.statusid = statusdetails.statusid 
        WHERE tasklist.uid = ${id};`;
      // let queryObj = `SELECT * FROM task;`;
      // Execute the query and store the result in "taskList"
      const resultObj = await db.promise(queryObj);
      console.log('resultObj', JSON.stringify(resultObj));
      // Return the task list to the caller
      return resultObj;
    } catch (error) {
      // Log any errors that occur
      logger.error(error);
    }
  },

  //VIEW TASK BY TASKTITLE
  doViewbyName: async (requestObj) => {
    console.log('requestBody', requestObj);

    const taskTitle = requestObj || '';
    console.log('tasktitle', taskTitle);
    try {
      // SQL query to search a task from the tasklist table of a particular user

      let queryObj = `SELECT tasklist.taskid, tasklist.tasktitle, tasklist.taskdescription, tasklist.taskstartdatetime, tasklist.taskenddatetime, tasktype.tasktypetitle, priority.prioritytype, statusdetails.statustitle 
      FROM tasklist 
      INNER JOIN tasktype ON tasklist.tasktypeid = tasktype.tasktypeid 
      INNER JOIN priority ON tasklist.priorityid = priority.priorityid 
      INNER JOIN statusdetails ON tasklist.statusid = statusdetails.statusid 
      WHERE tasklist.tasktitle = '${taskTitle}'`;

      // Execute the query and store the result in "taskList"
      const resultObj = await db.promise(queryObj);
      console.log('resultObj', JSON.stringify(resultObj));
      // Return the task list to the caller
      return resultObj;
    } catch (error) {
      // Log any errors that occur
      logger.error(error);
    }
  },

  doViewbyId: async (requestObj) => {
    console.log('requestBody', requestObj);

    const taskId = requestObj || '';
    console.log('taskid', taskId);
    try {
      // SQL query to search a task from the tasklist table of a particular user

      let queryObj = `SELECT tasklist.taskid, tasklist.tasktitle, tasklist.taskdescription, tasklist.taskstartdatetime, tasklist.taskenddatetime, tasktype.tasktypetitle, priority.prioritytype, statusdetails.statustitle 
      FROM tasklist 
      INNER JOIN tasktype ON tasklist.tasktypeid = tasktype.tasktypeid 
      INNER JOIN priority ON tasklist.priorityid = priority.priorityid 
      INNER JOIN statusdetails ON tasklist.statusid = statusdetails.statusid 
      WHERE tasklist.taskid = '${taskId}'`;

      // Execute the query and store the result in "taskList"
      const resultObj = await db.promise(queryObj);
      console.log('resultObj', JSON.stringify(resultObj));
      // Return the task list to the caller
      return resultObj;
    } catch (error) {
      // Log any errors that occur
      logger.error(error);
    }
  },

  //UPDATE TASK BY TASKID
  doUpdate: async (httpRequest) => {
    console.log('httpRequest', httpRequest);
    let id = httpRequest.params.id;
    console.log('num', id);

    const {
      newTaskTitle,
      newTaskDescription,
      newTaskStartDateTime,
      newTaskEndDateTime,
      newTaskTypeTitle,
      newPriorityType,
      newStatusTitle,
    } = httpRequest.body;
console.log(httpRequest.body);
    let queryObj = `UPDATE tasklist
    INNER JOIN tasktype ON tasklist.tasktypeid = tasktype.tasktypeid
    INNER JOIN priority ON tasklist.priorityid = priority.priorityid
    INNER JOIN statusdetails ON tasklist.statusid = statusdetails.statusid
    SET tasktitle = '${newTaskTitle}',
        taskdescription = '${newTaskDescription}',
        taskstartdatetime = '${newTaskStartDateTime}',
        taskenddatetime = '${newTaskEndDateTime}',
        tasktype.tasktypetitle = '${newTaskTypeTitle}',
        priority.prioritytype = '${newPriorityType}',
        statusdetails.statustitle = '${newStatusTitle}'
    WHERE tasklist.taskid = '${id}';`;
    const resultObj = await db.promise(queryObj);
    console.log(resultObj);
    return resultObj;
  },

  //DELETE TASK BY TASKID
  doDelete: async (requestObj) => {
    console.log('requestBody', requestObj);

    const taskId = requestObj || '';
    console.log('taskId', taskId);
    try {
      // SQL query to delete particular task from the tasklist table of a particular user
      let queryObj = `DELETE FROM tasklist WHERE taskid = ${taskId}`;
      // Execute the query and delete the result from "tasklist"
      const resultObj = await db.promise(queryObj);
      console.log('resultObj', JSON.stringify(resultObj));
      // Return the task list to the caller
      return resultObj;
    } catch (error) {
      // Log any errors that occur
      logger.error(error);
    }
  }
};

module.exports = CreateService;
