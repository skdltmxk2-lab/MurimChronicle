"use client";

import type { IQuestionRepository } from "@/lib/questions/IQuestionRepository";
import { supabaseQuestionRepo } from "@/lib/questions/SupabaseQuestionRepository";

export const questionRepo: IQuestionRepository = supabaseQuestionRepo;
