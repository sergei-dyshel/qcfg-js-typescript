/**
 * @file Cloudwatch
 *
 *   Functions for building and parsing CloudWatch URLs
 *
 *   See following resources for explanation of how these URLs are encoded:
 *
 *   - https://stackoverflow.com/questions/60796991/is-there-a-way-to-generate-the-aws-console-urls-for-cloudwatch-log-group-filters
 *   - https://repost.aws/questions/QUkdGEQP7rQZmDBUaB2Ai2Qg/aws-cloudwatch-log-insights-generate-url
 *   - https://stackoverflow.com/questions/68429312/generate-aws-logs-insights-url-with-query-and-search-creteria
 */
import * as jsurl from "jsurl";
import { assert } from "../error";
import { pick } from "../object";
import { removePrefix, split } from "../string";
import { decodeUriQuery, encodeUriQuery, URI, type UriQuery } from "../uri";
import { AWS_CONSOLE } from "./common";

const PATH = "/cloudwatch/home";

const FRAGMENT_PREFIX = "logsV2:";

const INSIGHTS_PATH = "logs-insights";

export interface Parsed {
  /** (external) region name that is encoded in URI domain name as well as URI query */
  region: string;

  /**
   * Path that is encoded in URI fragment.
   *
   * Used to specify which CloudWatch page to open: events/insights etc.
   */
  path: string;

  /**
   * Query parameters encode in fragment.
   *
   * Used to specify parameters for events/insights/query
   */
  query?:
    | {
        queryDetail?: InsightsQueryDetail;
      }
    | EventsQuery;
}

export interface InsightsQueryDetail {
  start: number | string;
  end: number | string;
  timeType: "RELATIVE" | "ABSOLUTE";
  tz: "UTC" | "LOCAL";
  /** Only needed with RELATIVE */
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  unit?: "seconds" | string;
  editorString: string;
  queryBy: "logGroupName"; // there are other options
  // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
  lang: "CWLI" | string;
  logClass: "STANDARD";
  /** List of log groups */
  source: string[];
}

export interface EventsQuery {
  start?: number;
  end?: number;
}

export function parse(url: string): Parsed {
  const uri = URI.parse(url);
  const [region, domain] = split(uri.authority, ".", 1 /* maxSplit */);
  assert(domain === AWS_CONSOLE, "Not a AWS console URL", url);
  assert(uri.path === PATH, "Not a cloudwatch URL path", url);
  assert(uri.fragment.startsWith(FRAGMENT_PREFIX), "Invalid cloudwatch URL fragmen", url);
  const uriQuery = new URLSearchParams(uri.query);
  assert(uriQuery.get("region") === region, "Invalid region in cloudwatch URL query", url);

  const fragment = decodeURIComponent(
    removePrefix(uri.fragment, FRAGMENT_PREFIX).replaceAll("$", "%"),
  );
  const [path, queryStr] = split(fragment, "?") as [string, string | undefined];
  const query = queryStr ? (decodeUriQuery(queryStr) as Parsed["query"]) : undefined;
  if (query && "queryDetail" in query)
    query.queryDetail = jsurl.parse(
      query.queryDetail as unknown as string,
    ) as unknown as InsightsQueryDetail;
  return { region, path, query };
}

export function build(region: string, path: string, query?: UriQuery) {
  /** The reverse operation of what's done in `parse` */
  const fragment =
    FRAGMENT_PREFIX +
    path +
    encodeURIComponent(query ? "?" + encodeUriQuery(query) : "").replaceAll("%", "$");
  const uri = URI.from({
    scheme: "https",
    authority: `${region}.${AWS_CONSOLE}`,
    path: PATH,
    query: encodeUriQuery({ region }),
    fragment,
  });
  return uri.toString(true /* skipEncoding */);
}

export function buildEvents(
  region: string,
  logGroup: string,
  opts?: {
    logStream?: string;
  } & EventsQuery,
) {
  const pathComponents = ["log-groups", "log-group", logGroup, "log-events"];
  if (opts?.logStream) {
    pathComponents.push(opts.logStream);
  }
  const query = pick(opts ?? ({} as EventsQuery), "start", "end");
  return build(region, pathComponents.join("/"), query);
}

export function buildInsights(region: string, queryDetail: InsightsQueryDetail) {
  return build(region, INSIGHTS_PATH, { queryDetail: jsurl.stringify(queryDetail) });
}
