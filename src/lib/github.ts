interface CreateGitHubIssueOptions {
  title: string;
  body: string;
  labels?: string[];
  owner?: string;
  repo?: string;
}

export async function createGitHubIssue({
  title,
  body,
  labels = ["support-escalation"],
  owner: overrideOwner,
  repo: overrideRepo,
}: CreateGitHubIssueOptions) {
  const token = process.env.GITHUB_TOKEN;
  const owner = overrideOwner || process.env.GITHUB_REPO_OWNER || "tildemark";
  const repo = overrideRepo || process.env.GITHUB_REPO_NAME || "trace";

  if (!token) {
    throw new Error("GITHUB_TOKEN is not configured in environment variables.");
  }

  const res = await fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github+json",
      "User-Agent": "Issue-Bridge-Proxy",
      "X-GitHub-Api-Version": "2022-11-28",
    },
    body: JSON.stringify({
      title,
      body,
      labels,
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    throw new Error(data.message || `GitHub API error (${res.status})`);
  }

  return {
    issueNumber: data.number as number,
    issueUrl: data.html_url as string,
    state: data.state as string,
    title: data.title as string,
  };
}
