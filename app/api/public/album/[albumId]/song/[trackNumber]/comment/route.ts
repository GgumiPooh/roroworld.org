import { POST as handlePost } from "../comments/route";

type RouteContext = {
  params: Promise<{ albumId: string; trackNumber: string }>;
};

export async function POST(req: Request, context: RouteContext): Promise<Response> {
  return handlePost(req, context);
}
