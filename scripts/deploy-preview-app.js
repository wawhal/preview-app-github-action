import fetch from 'node-fetch';
const GITHUB_TOKEN = process.env.GITHUB_PAT || '';
const HASURA_CLOUD_PAT = process.env.HASURA_CLOUD_PAT || '';
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || '';
const GITHUB_BRANCH_NAME = process.env.GITHUB_HEAD_REF || '';
const HASURA_PROJECT_DIR_PATH = process.env.HASURA_PROJECT_DIR_PATH || '';
const PR_NUMBER = process.env.PR_NUMBER || '123';
const CLOUD_DATA_GRAPHQL_ENDPOINT = process.env.CLOUD_DATA_GRAPHQL_ENDPOINT || 'https://data.lux-dev.hasura.me';
const GITHUB_OWNER = GITHUB_REPOSITORY.split('/')[0];
const GITHUB_REPO_NAME = GITHUB_REPOSITORY.split('/')[1];
const PREVIEW_APP_NAME = `${GITHUB_REPO_NAME}-pr-${PR_NUMBER}`;

const hasuraCloudHeaders = {
	authorization: `pat ${HASURA_CLOUD_PAT}`,
	'content-type': "application/json"
};

const githubHeaders = {
	'content-type': 'application/json',
	'authorization': `token ${GITHUB_TOKEN}`,
	'accept': 'application/json'
};

const commentOnPullrequest = (projectId, type="created") => {
	return fetch(
		`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO_NAME}/issues/${PR_NUMBER}/comments`,
		{
			method: 'POST',
			headers: githubHeaders,
			body: JSON.stringify({
				body: `Hasura Cloud Preview App is ${type === 'created' ? 'deployed' : 'redeployed'}. Access the console at https://cloud.hasura.io/project/${projectId}/console`
			})
		}
	).then(r => {
		if (r.status <=300) {
			console.log('Commented successfully');
		} else {
			console.log('Trouble commenting');
		}
	})
}


const createPreviewApp = () => {
	console.log('Creating preview app');
	return fetch(
		CLOUD_DATA_GRAPHQL_ENDPOINT,
		{
			method: 'POST',
			headers: hasuraCloudHeaders,
			body: JSON.stringify({
				query: `
					mutation createPreviewApp (
					  $githubPAT: String!
					  $appName: String!
					  $githubRepoOwner: String!
					  $githubRepo: String!
					  $githubBranch: String!
					  $githubDir: String!
					  $region: String!
					  $cloud: String!
					  $plan: String!
					) {
					  createGitHubPreviewApp (
					    payload: {
					      githubPersonalAccessToken: $githubPAT,
					      githubRepoDetails: {
					        branch:$githubBranch
					        owner: $githubRepoOwner
					        repo: $githubRepo,
					        directory: $githubDir
					      },
					      projectOptions: {
					        cloud: $cloud,
					        region: $region,
					        plan: $plan,
					        name: $appName
					      }
					    }
					  ) {
					    github_deployment_job_id
					    projectId
					  }
					}
					`,
					variables: {
						githubPAT: GITHUB_TOKEN,
						appName: PREVIEW_APP_NAME,
						githubRepoOwner: GITHUB_OWNER,
						githubRepo: GITHUB_REPO_NAME,
						githubBranch: GITHUB_BRANCH_NAME,
						githubDir: HASURA_PROJECT_DIR_PATH,
						region: "us-east-2",
						cloud: "aws",
						plan: "cloud_free"
					}
			})
		}
	).then(r => r.json())
	.then(response => {
		if (response.errors) {
			console.log('Failed creating preview app');
			console.log(response);
			process.exit(1);
		}
		if (response.data && response.data.createGitHubPreviewApp) {
			commentOnPullrequest(response.data.createGitHubPreviewApp.projectId);
		} else {
			console.log('Unexpected error');
			console.log(response);
			process.exit(1);
		}
	})
};

const recreatePreviewApp = () => {
	console.log('Recreating preview app');
	return fetch(
		CLOUD_DATA_GRAPHQL_ENDPOINT,
		{
			method: 'POST',
			headers: hasuraCloudHeaders,
			body: JSON.stringify({
				query: `
					mutation redeploy ($appName: String!) {
					  recreateGithubPreviewApp (
					    payload: {
					      appName: $appName
					    }
					  ) {
					    github_deployment_job_id
					    projectId
					  }
					}
				`,
					variables: {
						appName: PREVIEW_APP_NAME,
					}
			})
		}
	).then(r => r.json())
	.then(response => {
		if (response.errors) {
			console.log('Failed recreating preview app');
			console.log(response);
			process.exit(1);
		}
		if (response.data && response.data.recreateGithubPreviewApp) {
			commentOnPullrequest(response.data.recreateGithubPreviewApp.projectId, 'recreated');
		} else {
			console.log('Unexpected error');
			console.log(response);
			process.exit(1);
		}
	})
	.catch(e => {
		console.log('Unexpected error');
		console.log(e);
		process.exit(1);
	})
}

const handlePREvent = () => {

	return fetch(
		CLOUD_DATA_GRAPHQL_ENDPOINT,
		{
			method: 'POST',
			headers: hasuraCloudHeaders,
			body: JSON.stringify({
				query: `
					query {
						projects (where: { name: { _eq: "${PREVIEW_APP_NAME}"}}) {
							id
						}
					}
				`,
			})
		}
	).then(r => r.json())
	.then(response => {
		if (response.errors) {
			console.error('Error querying the projects');
			console.log(response);
			process.exit(1);
		}
		if (response.data && response.data.projects) {
			if (response.data.projects.length) {
				recreatePreviewApp();
			} else {
				createPreviewApp();
			}
		} else {
			console.log(response);
			console.error('Unexpected response while checking project')
			process.exit(1);
		}
	}).catch(e => {
		console.log('Unexpected error');
		console.log(e);
		process.exit(1);
	})

}

handlePREvent();
