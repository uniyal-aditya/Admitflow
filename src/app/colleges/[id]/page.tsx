"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft, ExternalLink, Globe, Mail, Phone, MapPin,
  Calendar, Star, BookOpen, FileText, GraduationCap, DollarSign,
  Users, Award, Building2, ChevronRight, Clock, Bell,
} from "lucide-react";
import { colleges, collegeTimelines } from "@/data/colleges";
import { CollegeLogo } from "@/components/CollegeLogo";
import { getNoticesByCollege } from "@/data/notices";
import { NoticeCard } from "@/components/NoticeCard";
import { Timeline } from "@/components/Timeline";
import { useSyncFavorite } from "@/hooks/useSyncFavorite";
import { noticeTypeColor, noticeTypeLabel, formatDate, collegeTypeLabel, ownershipColor, getComputedStatus, computeTimeline } from "@/lib/utils";

export default function CollegeDetailPage() {
  const params = useParams();
  const id = params.id as string;
  const college = colleges.find((c) => c.id === id);
  const [isFav, toggleFav] = useSyncFavorite(id);

  if (!college) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-gray-400">
        <Building2 className="h-16 w-16 mb-4" />
        <p className="text-xl font-medium">College not found</p>
        <Link href="/colleges" className="mt-4 text-indigo-600 hover:underline">Back to colleges</Link>
      </div>
    );
  }

  const collegeNotices = getNoticesByCollege(id);
  const rawTimeline = collegeTimelines[id];
  const timeline = rawTimeline ? computeTimeline(rawTimeline) : undefined;
  const activeNotices = collegeNotices.filter((n) => getComputedStatus(n) === "active");

  return (
    <div className="space-y-8">
      <Link
        href="/colleges"
        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Colleges
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-4">
              <CollegeLogo collegeId={college.id} name={college.shortName} size="lg" />
              <div>
                <h1 className="text-2xl font-bold">{college.name}</h1>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${noticeTypeColor(college.type === "university" ? "admission" : "registration")}`}>
                    {collegeTypeLabel(college.type, college.ownership)}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ownershipColor(college.ownership)}`}>
                    {college.ownership === "government" ? "Government" : college.ownership === "private" ? "Private" : college.ownership === "deemed" ? "Deemed University" : college.ownership}
                  </span>
                  <span className="flex items-center gap-1 text-sm text-gray-500">
                    <MapPin className="h-3.5 w-3.5" />
                    {college.location}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={toggleFav}
              className={`rounded-xl p-2.5 transition-colors ${
                isFav
                  ? "text-yellow-500 hover:text-yellow-600 bg-yellow-50 dark:bg-yellow-950/30"
                  : "text-gray-300 hover:text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800"
              }`}
            >
              <Star className={`h-6 w-6 ${isFav ? "fill-current" : ""}`} />
            </button>
          </div>

          <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
            {college.description}
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl border bg-white p-4 dark:bg-gray-900 dark:border-gray-800">
              <Calendar className="h-4 w-4 text-gray-400 mb-1" />
              <p className="text-xs text-gray-400">Established</p>
              <p className="font-semibold text-sm">{college.established}</p>
            </div>
            <div className="rounded-xl border bg-white p-4 dark:bg-gray-900 dark:border-gray-800">
              <Award className="h-4 w-4 text-gray-400 mb-1" />
              <p className="text-xs text-gray-400">Accreditation</p>
              <p className="font-semibold text-sm">{college.accreditation}</p>
            </div>
            <div className="rounded-xl border bg-white p-4 dark:bg-gray-900 dark:border-gray-800">
              <BookOpen className="h-4 w-4 text-gray-400 mb-1" />
              <p className="text-xs text-gray-400">Courses</p>
              <p className="font-semibold text-sm">{college.courses.length} programs</p>
            </div>
            <div className="rounded-xl border bg-white p-4 dark:bg-gray-900 dark:border-gray-800">
              <Users className="h-4 w-4 text-gray-400 mb-1" />
              <p className="text-xs text-gray-400">Affiliation</p>
              <p className="font-semibold text-sm truncate">{college.affiliation}</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href={college.website}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors"
            >
              <Globe className="h-4 w-4" />
              Official Website
              <ExternalLink className="h-3 w-3" />
            </a>
            <a
              href={college.admissionPortal}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors"
            >
              <FileText className="h-4 w-4" />
              Admission Portal
            </a>
          </div>

          {college.contact && (
            <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
              <h2 className="font-semibold mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="h-4 w-4 text-gray-400" />
                  <span>{college.contact.phone}</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span>{college.contact.email}</span>
                </div>
              </div>
            </div>
          )}

          <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
            <h2 className="font-semibold mb-4 flex items-center gap-2">
              <GraduationCap className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              Available Courses
            </h2>
            <div className="space-y-3">
              {college.courses.map((course) => (
                <div
                  key={course.name}
                  className="rounded-lg border bg-gray-50 p-4 dark:bg-gray-800/50 dark:border-gray-700"
                >
                  <div className="flex items-center justify-between">
                    <p className="font-medium text-sm">{course.name}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{course.duration}</span>
                      <span className="flex items-center gap-1"><Users className="h-3 w-3" />{course.seats} seats</span>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                    <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" />₹{course.fees.toLocaleString()}/yr</span>
                    <span>{course.eligibility}</span>
                  </div>
                  {course.branches && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {course.branches.map((b) => (
                        <span key={b} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                          {b}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="lg:w-96 space-y-6">
          {timeline && (
            <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
              <h2 className="font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                Admission Timeline
              </h2>
              <Timeline data={timeline} />
            </div>
          )}

          <div className="rounded-xl border bg-white p-5 dark:bg-gray-900 dark:border-gray-800">
            <h2 className="font-semibold mb-4">Quick Stats</h2>
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total Notices</span>
                <span className="font-medium">{collegeNotices.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Active Notices</span>
                <span className="font-medium text-green-600">{activeNotices.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Courses Offered</span>
                <span className="font-medium">{college.courses.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold flex items-center gap-2">
          <Bell className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          Notices from {college.shortName}
        </h2>
        {collegeNotices.length === 0 ? (
          <p className="text-gray-400">No notices yet</p>
        ) : (
          <div className="grid md:grid-cols-2 gap-3">
            {collegeNotices.slice(0, 6).map((notice) => (
              <NoticeCard key={notice.id} notice={notice} />
            ))}
          </div>
        )}
        {collegeNotices.length > 6 && (
          <Link
            href={`/notices?college=${college.id}`}
            className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-700 dark:text-indigo-400"
          >
            View all {collegeNotices.length} notices
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
