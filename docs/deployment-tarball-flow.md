# Deployment Tarball Flow

## Goal

Make container deployment mirror SSH deployment as closely as practical.

Both deployment modes should deliver one deployable tarball and extract it at the target.

## Target Config Contract

Deployment targets should use:

- `baseUrl`: scheme and host only, without a port
- optional `port`: numeric port only
- `staticUriPath`: URI path prefix for static survey pages
- `cgiUriPath`: URI path prefix for CGI endpoints

Do not encode the port anywhere else in `target.json`.

If `port` is omitted:

- treat `http` as port `80`
- treat `https` as port `443`
- omit the explicit port in generated URLs whenever possible

## SSH Deployment

SSH deployment should:

1. build one deployable tarball;
2. transfer it to the target;
3. extract it in place at the target;
4. run `setup.sh` only if extraction alone is not yet sufficient.

## Container Deployment

Container deployment should follow the same shape as SSH deployment, but use `docker exec` where SSH would run remote commands.

Container deployment should:

1. build one deployable tarball;
2. prepare or start the target container;
3. place the tarball where the container can access it;
4. extract it in place inside the container via `docker exec`;
5. run `setup.sh` only if extraction alone is not yet sufficient.

## Setup Script Policy

Preferred end state:

- tarball extraction alone is sufficient;
- `setup.sh` is unnecessary and can be removed.

Until then:

- always include `setup.sh` in the tarball;
- always run it after extraction.

## Verification Expectations

This design is satisfied when:

- container and SSH deployment both start from one deployable tarball;
- URL construction reads host, optional port, and URI paths from `target.json`;
- the configured port number exists exactly once in source target data;
- generated survey and CGI URLs resolve correctly for both default and non-default ports;
- deployment tests cover both extraction flow and URL generation.
