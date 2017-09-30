# git-code package

Git Code Tools(Source, Blame and History)

## Feature

* Support GitHub
* Support GitLab

## Install

```
cd ~/.atom/packages
git clone https://github.com/wenzhixin/atom-git-code.git git-code
apm install

vi ~/.git-core
```

```
git@github.com=https://github.com
```

Config syntax: `alias=url`. For example:
```
mygitlab=http://192.168.1.100/gitlab
```

You can get your alias via `git config --get remote.origin.url` in your git repo.
