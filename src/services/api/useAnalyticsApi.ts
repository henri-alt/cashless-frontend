import { useCallback } from "react";
import axios from "axios";
import {
  EventType,
  GetEventExportAnalyticsResponse,
  GetAllReportsResponse,
  GetEventReportResponse,
} from "@/types";
import { useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

type UseAnalyticsApiParam = {
  event?: EventType;
};

interface CreateDownloadParam {
  blob: Blob;
  fileName: string;
}

interface GetEventReportParam {
  eventId: string;
}

export function useAnalyticsApi(params?: UseAnalyticsApiParam) {
  const { toast } = useToast();

  const get = useCallback(async () => {
    if (!params?.event) {
      return Promise.reject("No provided event");
    }

    return axios
      .get<GetEventExportAnalyticsResponse>(
        `/events/${params?.event.eventId}/exportAnalytics`
      )
      .then((res) => res.data);
  }, [params?.event]);

  const createDownload = useCallback((param: CreateDownloadParam) => {
    const href = URL.createObjectURL(param.blob);
    const link = document.createElement("a");
    link.href = href;
    link.setAttribute("download", `${param.fileName}.xlsx`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(href);
  }, []);

  const excelExport = useCallback(async () => {
    if (!params?.event) {
      return Promise.reject("No provided event");
    }

    return axios
      .get<Blob>(`/events/${params?.event.eventId}/exports`, {
        responseType: "blob",
      })
      .then((r) => {
        createDownload({
          blob: r.data,
          fileName:
            params?.event?.eventName.replace(/\s/g, "_") +
            "-" +
            new Date(params?.event?.startDate || "").toLocaleDateString(),
        });
      });
  }, [params?.event, createDownload]);

  const getAllReports = useCallback(async () => {
    return axios.get<GetAllReportsResponse>("/reports").then((res) => {
      return res.data;
    });
  }, []);

  const getEventReport = useCallback(async (param: GetEventReportParam) => {
    return axios
      .get<GetEventReportResponse>(`/events/${param.eventId}/report`)
      .then((res) => {
        return res.data;
      });
  }, []);

  return {
    get,
    excelExport,
    getAllReports,
    getEventReport: useMutation({
      mutationFn: getEventReport,
      onSuccess(data) {
        const buf = new Uint8Array(data.fileData.data);
        const blob = new Blob([buf]);

        createDownload({
          blob,
          fileName: data.fileName,
        });
      },
      onError(error) {
        console.error("Error getting report: ", error);
        toast({
          variant: "destructive",
          title: "Error downloading report",
          description:
            "Something went wrong while trying to download this report, please try again later",
        });
      },
    }),
  };
}
