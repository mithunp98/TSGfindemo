import axios from '../../utils/interceptors';
import React, { useState } from 'react';
import { useNavigate } from 'react-router';

const Updatetaskservice = async (tasktitle: string, taskdescription: string, taskstartdatetime: string,
    taskenddatetime: string, tasktypetitle: string, prioritytype: string,
    statustitle: string, userId: number, accessToken: string, taskId: number) => {
    try {
        const response = await axios.put(`http://localhost:3000/todo/taskupdate/${taskId}`, {
            tasktitle,
            taskdescription,
            taskstartdatetime,
            taskenddatetime,
            tasktypetitle,
            prioritytype,
            statustitle,
        });
        if (response.status === 200) {
            // eslint-disable-next-line no-console
            console.log('responsedata',response.data);
          return response.data;
        } else {
          throw new Error(`Unable to delete task with id ${taskId}. Response status: ${response.status}`);
        }
      } catch (error) {
        // eslint-disable-next-line no-console
        console.error(error);
        throw error;
        }
};



export default Updatetaskservice;
