import fetch from 'node-fetch';
const GITHUB_TOKEN = process.env.GITHUB_PAT || '';
const HASURA_CLOUD_PAT = process.env.HASURA_CLOUD_PAT || '';
const GITHUB_REPOSITORY = process.env.GITHUB_REPOSITORY || '';
const GITHUB_BRANCH_NAME = process.env.GITHUB_HEAD_REF || '';
const HASURA_PROJECT_DIR_PATH = process.env.HASURA_PROJECT_DIR_PATH || '';
const PR_NUMBER = process.env.PR_NUMBER || '123';
const CLOUD_DATA_GRAPHQL = process.env.CLOUD_DATA_GRAPHQL_ENDPOINT || 'https://data.lux-dev.hasura.me';
const GITHUB_OWNER = GITHUB_REPOSITORY.split('/')[0];
const GITHUB_REPO_NAME = GITHUB_REPOSITORY.split('/')[1];

const createPreviewApp = () => {
	console.log('Creating preview app');
};

const recreatePreviewApp = () => {
	console.log('Recreating preview app');
}

const handlePREvent = () => {

	const previewAppName = `${GITHUB_REPO_NAME}-pr-${PR_NUMBER}-`;
	return fetch(
		CLOUD_DATA_GRAPHQL_ENDPOINT,
		{
			method: 'POST',
			headers: {
				'authorization': `PAT ${HASURA_CLOUD_PAT}`
			},
			body: JSON.stringify({
				query: `
					query {
						projects (where: { name: { _eq: "${previewAppName}"}}) {
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
			process.exit(1);
		}
		if (response.data && response.data.projects) {
			console.log(response);
			if (response.data.projects.length) {
				recreatePreviewApp();
			} else {
				createPreviewApp();
			}
		} else {
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
