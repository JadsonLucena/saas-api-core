# Welcome to the contribution guide

Thank you for investing your time in contributing to our project!

Read our [Code of Conduct](CODE_OF_CONDUCT.md) to keep our community approachable and respectable.

## New contributor guide

To get an overview of the project, read the [README](README.md). Here are some resources to help you get started with open source contributions:

- [Finding ways to contribute to open source on GitHub](https://docs.github.com/en/get-started/exploring-projects-on-github/finding-ways-to-contribute-to-open-source-on-github)
- [Collaborating with pull requests](https://docs.github.com/en/github/collaborating-with-pull-requests)
- [GitHub flow](https://docs.github.com/en/get-started/quickstart/github-flow)
- [Conventional commits](https://www.conventionalcommits.org)
- [ESLint](https://eslint.org/)

## Getting started

- [Fork the repo](https://docs.github.com/en/github/getting-started-with-github/fork-a-repo#fork-an-example-repository)
- [Set up Git](https://docs.github.com/en/get-started/quickstart/set-up-git)
- [Set up Node.js](https://nodejs.org/en/download)

### Running the tests

```Shell
git clone https://github.com/JadsonLucena/saas-api-core
cd saas-api-core
npm install
npm test
```

## Issues

If you spot a problem in the project, [search if an issue already exists](https://docs.github.com/en/github/searching-for-information-on-github/searching-on-github/searching-issues-and-pull-requests#search-by-the-title-body-or-comments).\
You can narrow down the search using [labels](../../labels) as filters.\
If you feel an open-ended discussion with the community and maintainers would be more suitable to forming the right details for your feature request, you can post in [Discussions](../../discussions) instead.\
As a general rule, we don’t assign issues to anyone.\
If you find an [issue](../../issues) to work on, you are welcome to open a PR with a fix.\
If a related issue doesn't exist, you can open a new issue using a relevant [issue form](../../issues/new/choose).

## Pull Request

When you're finished with the changes, create a pull request, also known as a PR.
- Search for an [open or closed PR](../../pulls) that relates to your submission. You don't want to duplicate existing efforts.
- Submit the PR to the **Develop branch**
- Don't forget to [link PR to issue](https://docs.github.com/en/issues/tracking-your-work-with-issues/linking-a-pull-request-to-an-issue) if you are solving one.
- Enable the checkbox to [allow maintainer edits](https://docs.github.com/en/github/collaborating-with-issues-and-pull-requests/allowing-changes-to-a-pull-request-branch-created-from-a-fork) so the branch can be updated for a merge.
- After submitting your PR, it will undergo [code review](https://docs.github.com/pt/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews) by the maintainers

## Coding Rules
To ensure consistency throughout the source code, keep these rules in mind as you are working:

* All features or bug fixes **must be tested** by one or more specs (unit-tests).
* All public API methods **must be documented**.
* Where applicable, follow standards:
	- TDD
	- SOLID
	- Object Calisthenics
	- Clean Code
	- Designer Partner
	- [JavaScript Standard Style Guide](https://standardjs.com)