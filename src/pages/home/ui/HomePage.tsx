import { CONTACT_EMAIL } from "@/shared/config";
import { BlogIcon, InstagramIcon, SignIcon, YoutubeIcon } from "@/shared/icons";
import { cn } from "@/shared/lib";
import { BlurBackground, Button, ExternalLink } from "@/shared/ui";

export type HomePageProps = {
  className?: string;
  contactEmail?: string;
};

const SOCIAL_LINKS = {
  blog: "https://m.blog.naver.com/PostList.naver?blogId=hanr0r0&tab=1",
  homepage: "https://www.hanroro.com",
  instagram: "https://www.instagram.com/hanr0r0/?hl=ko",
  youtube: "https://www.youtube.com/@hanroro6055",
} as const;

export function HomePage({ className, contactEmail = CONTACT_EMAIL }: HomePageProps) {
  return (
    <div className={cn("relative h-dvh text-black", className)}>
      <BlurBackground />
      <SignIcon className="absolute bottom-[8%] left-[2%] w-60 text-[#dccca1] sm:w-100 md:bottom-20 md:left-5 md:w-120" />
      <div className="absolute bottom-[2.5%] left-[3%]">
        <h3 className="text-left text-xs text-[#c4bda8] md:text-sm">
          NOT OFFICIAL SITE
          <br />
          CONTACT : {contactEmail}
        </h3>
      </div>
      <div className="absolute right-[3%] bottom-[2.5%] flex flex-col gap-10 sm:gap-20 md:bottom-15">
        <ExternalLink ariaLabel="Blog 채널로 이동" href={SOCIAL_LINKS.blog}>
          <Button size="sm" variant="icon">
            <BlogIcon className="ml-1 h-7 text-[#38bb0c] sm:h-10" />
          </Button>
        </ExternalLink>
        <ExternalLink ariaLabel="Instagram 채널로 이동" href={SOCIAL_LINKS.instagram}>
          <Button size="sm" variant="icon">
            <InstagramIcon className="h-10 sm:h-14" />
          </Button>
        </ExternalLink>
        <ExternalLink ariaLabel="YouTube 채널로 이동" href={SOCIAL_LINKS.youtube}>
          <Button size="sm" variant="icon">
            <YoutubeIcon className="ml-1 h-8 sm:h-12" />
          </Button>
        </ExternalLink>
        <ExternalLink ariaLabel="hanroro 홈페이지로 이동" href={SOCIAL_LINKS.homepage}>
          <Button size="sm" variant="icon">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              className="h-9 rounded-4xl sm:h-13"
              alt="hanroro 홈페이지"
              src="/images/hanroro.webp"
            />
          </Button>
        </ExternalLink>
      </div>
    </div>
  );
}
