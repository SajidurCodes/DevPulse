import type { Request, Response } from "express";
import sendResponse from "../../utils/sendResponse";
import { IssueService } from "./issue.service";




const createIssue = async (req: Request, res: Response) => {

  console.log(req.body);
  
  try {
    
    

    const payload = { ...req.body, reporter_id: (req as any).user?.id };

    const result = await IssueService.createIssue(payload);

    sendResponse(res, {
      success: true,
      statusCode: 201,
      message: "Issue created successfully",
      data: result,
    });



  } catch (error : any) {



    console.error(error);
    sendResponse(res, {
      success: false,
      statusCode: 500,
      message: "An error occurred while creating the issue",
    });



  }
};

const getAllIssues = async (req: Request, res: Response) => {
  try {
    const result = await IssueService.getAllIssues(req.query);

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Issues retrieved successfully",
      data: result,
    });
  } catch (error : any) {
    

    console.error(error);
    sendResponse(res, {
      success: false,
      statusCode: 500,
      message: "An error occurred while retrieving issues",
    });

  }
};


const getSingleIssue = async (req: Request, res: Response) => {

    try{
      const result = await IssueService.getSingleIssue(
      Number(req.params.id)
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Issue retrieved successfully",
      data: result,
    });

    } catch(err : any){


      console.error(err);
      sendResponse(res, {
      success: false,
      statusCode: 500,
      message: err.message || "Failed to fetch the issue",
      data: null,
    });

    }
  }


  const updateIssue = async (req: Request, res: Response) => {

    try{
      const result = await IssueService.updateIssue(
      Number(req.params.id),
      req.body,
      (req as any).user
    );

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Issue updated successfully",
      data: result,
    });

    } catch(err : any){


      console.error(err);
      sendResponse(res, {
      success: false,
      statusCode: 500,
      message: err.message ||"Failed to update the issue",
      data: null,
    });
    }
  }


const deleteIssue = async (req: Request,res: Response) =>{

  try {

    await IssueService.deleteIssue(Number(req.params.id));

    sendResponse(res, {
      success: true,
      statusCode: 200,
      message: "Issue deleted successfully",
      data: null,
    });

  } catch (err: any) {



    console.error(err);

    sendResponse(res, {
      success: false,
      statusCode: 500,
      message: err.message || "Failed to delete issue",
      data: null,
    });

  }
};



export const IssueController = {
    createIssue,
    getAllIssues,
    getSingleIssue,
    updateIssue,
    deleteIssue
};