import { sql } from "../../db";


const createIssueService = async (payload: any) =>{

  console.log(payload);
  const result = await sql`
    INSERT INTO issues(
      title,
      description,
      type,
      reporter_id
    )
    VALUES(
      ${payload.title},
      ${payload.description},
      ${payload.type},
      ${payload.reporter_id}
    )
    RETURNING id,title,description,type,status,reporter_id,created_at,updated_at
  `;

  return result[0];




};

const getAllIssuesService = async (query: any) => {

  
  const issues = await sql.query(`
    SELECT * FROM issues
  `);

  const formattedIssues =[];

  for(const issue of issues){

    const reporters= await sql.query(`
      SELECT id, name, role
      FROM users
      WHERE id = ${issue.reporter_id}
    `);

    const reporter = reporters[0];


    formattedIssues.push({
      id: issue.id,
      title: issue.title,
      description: issue.description,
      type: issue.type,
      status: issue.status,

      reporter: {
        id: reporter?.id,
        name: reporter?.name,
        role: reporter?.role,
      },

      created_at: issue.created_at,
      updated_at: issue.updated_at,
    });
  }

  return formattedIssues;
};

const getSingleIssueService = async (id: number) => {


  const issues = await sql`
    SELECT * FROM issues
    WHERE id=${id}
  `;

  const issue = issues[0];

  if (!issue) {
    throw new Error("Issue not found");
  }

  const users = await sql`
    SELECT id,name,role
    FROM users
    WHERE id=${issue.reporter_id}
  `;

  return {
    ...issue,
    reporter: users[0],
  };
};


const updateIssueService = async (
  id: number,
  payload: any,
  user: any
) => {

  const issues = await sql`
  
    SELECT * FROM issues
    WHERE id=${id}
  
  `;

  const issue = issues[0];

  if (!issue) {
    throw new Error("Issue not found");
  }

  if (user.role === "contributor") {

    if (issue.reporter_id !== user.id) {
      throw new Error("Forbidden");
    }

    if (issue.status !== "open") {
      throw new Error(
        "Cannot edit non-open issue"
      );
    }
  }

  const result = await sql`

    UPDATE issues
    SET
      title=${payload.title},
      description=${payload.description},
      type=${payload.type},
      updated_at=CURRENT_TIMESTAMP

    WHERE id=${id}

    RETURNING *

  `;

  return result[0];
};


const deleteIssueService = async (id: number) => {

  const result = await sql`
    DELETE FROM issues
    WHERE id=${id}
    RETURNING *
  `;

  
  if (!result[0]) {
    throw new Error("Issue not found");
  }



};


export const IssueService = {
  createIssue: createIssueService,
  getAllIssues: getAllIssuesService,
  getSingleIssue: getSingleIssueService,
  updateIssue: updateIssueService,
  deleteIssue: deleteIssueService
};