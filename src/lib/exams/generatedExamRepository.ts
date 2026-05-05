"use client";

import type { IExamRepository } from "@/lib/exams/IExamRepository";
import { supabaseExamRepo } from "@/lib/exams/SupabaseExamRepository";

export const examRepo: IExamRepository = supabaseExamRepo;
