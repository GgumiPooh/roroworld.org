import { cn, findMetadataUrl, selectLocalizedText } from "@/shared/lib";
import { Button, ExternalLink, ImageWithPlaceholder } from "@/shared/ui";
import { CheckCircleIcon, VideoCameraIcon } from "@heroicons/react/24/outline";
import { type Activity } from "../model/types";

export type ActivityCardProps = {
  className?: string;
  activity: Activity;
};

export function ActivityCard({ className, activity }: ActivityCardProps) {
  const metadataList = activity.metaData || activity.metadata || [];
  const imageUrl = findMetadataUrl(metadataList, "img");
  const videoUrl = findMetadataUrl(metadataList, "video");
  const titleText = selectLocalizedText(activity.title, ["ko"]);

  return (
    <li className={cn("flex w-full items-center", className)}>
      <div className="relative top-2/5 left-[-15px] h-6 w-6 rounded-2xl bg-gray-500/90 md:left-[-19px] md:h-8 md:w-8">
        <CheckCircleIcon
          className={cn(
            "size-6 md:size-8",
            isDateInPast(activity.activeTo) ? "text-[#faf8e1]" : "text-gray-500/50",
          )}
        />
      </div>
      <div className="ml-3 flex flex-row md:ml-30">
        <div className="mr-5 w-30 shrink-0 md:mr-10 md:w-45">
          <ImageWithPlaceholder
            className="h-auto w-full rounded-lg shadow-[0_13px_25px_rgba(97,120,150,0.4)]"
            alt="activity thumbnail"
            src={imageUrl}
          />
        </div>
        <div className="mr-5 h-auto border-l-3 pl-5 text-[#faf8e1]">
          <h2 className="text-lg font-bold text-plum-300">
            {formatDateRange(activity.activeFrom, activity.activeTo)}
          </h2>
          <p className="mb-5 text-base font-bold text-gray-100 md:text-lg">{titleText}</p>
          {videoUrl && (
            <ExternalLink href={videoUrl}>
              <Button size="sm" variant="secondary">
                <VideoCameraIcon className="size-4" />
              </Button>
            </ExternalLink>
          )}
        </div>
      </div>
    </li>
  );
}

function isLocalDateFormat(value: string): boolean {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function padZero(num: number): string {
  return num < 10 ? `0${num}` : String(num);
}

function getTodayDateString(): string {
  const today = new Date();
  return `${today.getFullYear()}-${padZero(today.getMonth() + 1)}-${padZero(today.getDate())}`;
}

function isDateInPast(dateValue: string): boolean {
  if (!dateValue) {
    return false;
  }
  if (isLocalDateFormat(dateValue)) {
    return dateValue < getTodayDateString();
  }
  const timestamp = Date.parse(dateValue);
  return Number.isFinite(timestamp) ? timestamp < Date.now() : false;
}

function formatDateString(dateValue: string): string {
  if (!dateValue) {
    return "";
  }
  if (isLocalDateFormat(dateValue)) {
    return dateValue.replaceAll("-", ".");
  }
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }
  return `${date.getUTCFullYear()}.${date.getUTCMonth() + 1}.${date.getUTCDate()}`;
}

function formatDateRange(activeFrom: string, activeTo: string): string {
  const formattedFrom = formatDateString(activeFrom);
  const formattedTo = formatDateString(activeTo);

  if (!formattedFrom) {
    return formattedTo;
  }
  if (!formattedTo) {
    return formattedFrom;
  }
  if (formattedFrom === formattedTo) {
    return formattedFrom;
  }

  return `${formattedFrom} ~ ${formattedTo}`;
}
