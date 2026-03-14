"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { fadeIn } from "@/lib/animations";
import { Send, CheckCircle2, Loader2, Sparkles, Upload, FileText, X } from "lucide-react";

type FormState = "idle" | "submitting" | "success";

export function IntakeForm() {
  const [state, setState] = React.useState<FormState>("idle");
  const [file, setFile] = React.useState<File | null>(null);
  const [isDragging, setIsDragging] = React.useState(false);
  
  const [formData, setFormData] = React.useState({
    name: "",
    email: "",
    projectType: "prototyping",
    material: "pla",
    description: "",
    hp_id: "", // Honeypot field
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const validExtensions = ['.stl', '.step', '.stp', '.3mf'];
      const fileName = droppedFile.name.toLowerCase();
      if (validExtensions.some(ext => fileName.endsWith(ext))) {
        setFile(droppedFile);
      } else {
        alert("Please upload a valid 3D file (.stl, .step, .3mf)");
      }
    }
  };

  const removeFile = () => setFile(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setState("submitting");
    
    // Updated to point to the Pi Relay (Tailscale Funnel)
    const PI_RELAY_URL = "https://your-pi-funnel-url/ingest";

    try {
      let fileData = null;
      let fileName = null;
      let fileType = null;

      if (file) {
        // Convert file to Base64 for the relay
        const reader = new FileReader();
        const base64Promise = new Promise((resolve) => {
          reader.onload = () => {
            const result = reader.result as string;
            resolve(result.split(',')[1]); // Extract base64 part
          };
          reader.readAsDataURL(file);
        });

        fileData = (await base64Promise) as string;
        fileName = file.name;
        fileType = file.type || "application/octet-stream";
      }

      const payload = {
        ...formData,
        token: "tara_forge_secure_2026", // Matches AUTH_TOKEN in Pi .env
        hp_id: formData.hp_id,
        fileData,
        fileName,
        fileType
      };

      const response = await fetch(PI_RELAY_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Relay rejected the transmission");
      }

      setState("success");
    } catch (error) {
      console.error("Submission error:", error);
      alert("There was an issue sending your design. Please try again or email us directly at taraforgeindia@gmail.com");
      setState("idle");
    }
  };

  if (state === "success") {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex flex-col items-center justify-center py-12 text-center"
      >
        <div className="relative mb-6">
          <div className="absolute inset-0 animate-ping rounded-full bg-brand-gold/20" />
          <CheckCircle2 className="relative h-16 w-16 text-brand-gold" />
        </div>
        <h3 className="text-2xl font-semibold text-slate-50">Transmission Received</h3>
        <p className="mt-2 text-slate-400">
          Your project blueprint and file have been queued for processing. <br />
          Our forge specialists will review it within 24 hours.
        </p>
        <button 
          onClick={() => { setState("idle"); setFile(null); }}
          className="mt-8 text-sm font-medium text-brand-gold hover:text-brand-gold-bright transition-colors"
        >
          Send another transmission
        </button>
      </motion.div>
    );
  }

  return (
    <motion.div 
      {...fadeIn(0.2)}
      className="relative overflow-hidden rounded-3xl border border-slate-800/80 bg-slate-900/40 p-1px shadow-2xl"
    >
      <div className="relative rounded-[23px] bg-slate-950/80 p-8 md:p-10 backdrop-blur-xl">
        <header className="mb-8">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-brand-gold/30 bg-brand-gold/5 px-3 py-1">
            <Sparkles className="h-3 w-3 text-brand-gold" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-brand-gold">
              Project Intake
            </span>
          </div>
          <h2 className="text-3xl font-semibold text-slate-50">Share Your <span className="celestial-gradient-text">Concept</span></h2>
          <p className="mt-2 text-sm text-slate-400">Provide the details; we&apos;ll handle the crafting.</p>
        </header>

        <form onSubmit={handleSubmit} className="grid gap-6 sm:grid-cols-2">
          {/* Honeypot field - Hidden from users */}
          <div className="hidden" aria-hidden="true">
            <input
              type="text"
              name="hp_id"
              tabIndex={-1}
              autoComplete="off"
              value={formData.hp_id}
              onChange={(e) => setFormData({ ...formData, hp_id: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="name" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Full Name</label>
            <input
              required
              id="name"
              type="text"
              placeholder="Cyrus Vesper"
              className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:border-brand-gold/50 focus:outline-none focus:ring-1 focus:ring-brand-gold/50 transition-all font-light"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="email" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Email Address</label>
            <input
              required
              id="email"
              type="email"
              placeholder="cyrus@nebula.com"
              className="w-full rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:border-brand-gold/50 focus:outline-none focus:ring-1 focus:ring-brand-gold/50 transition-all font-light"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="projectType" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Service Type</label>
            <select
              id="projectType"
              className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-slate-100 focus:border-brand-gold/50 focus:outline-none focus:ring-1 focus:ring-brand-gold/50 transition-all font-light"
              value={formData.projectType}
              onChange={(e) => setFormData({ ...formData, projectType: e.target.value })}
            >
              <option value="prototyping">Rapid Prototyping</option>
              <option value="parts">Custom Parts</option>
              <option value="batch">Small Batch Production</option>
              <option value="figurine">Artistic / Figurine</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label htmlFor="material" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Preferred Material</label>
            <select
              id="material"
              className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-slate-100 focus:border-brand-gold/50 focus:outline-none focus:ring-1 focus:ring-brand-gold/50 transition-all font-light"
              value={formData.material}
              onChange={(e) => setFormData({ ...formData, material: e.target.value })}
            >
              <option value="pla">PLA (General Purpose)</option>
              <option value="petg">PETG (Durable / Functional)</option>
              <option value="other">Consultation Needed</option>
            </select>
          </div>

          <div className="col-span-full space-y-1.5">
            <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Upload Your Design (STL, STEP, 3MF)</label>
            <div
              onDragOver={onDragOver}
              onDragLeave={onDragLeave}
              onDrop={onDrop}
              className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-8 transition-all ${
                isDragging 
                  ? "border-brand-gold bg-brand-gold/10" 
                  : "border-slate-800 bg-slate-900/30 hover:bg-slate-900/50"
              } ${file ? "border-brand-gold/50 bg-brand-gold/5" : ""}`}
            >
              <input
                type="file"
                id="file-upload"
                className="absolute inset-0 cursor-pointer opacity-0"
                accept=".stl,.step,.stp,.3mf"
                onChange={handleFileChange}
              />
              
              <AnimatePresence mode="wait">
                {file ? (
                  <motion.div 
                    key="file-selected"
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="flex items-center gap-4 text-left"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gold/20">
                      <FileText className="h-6 w-6 text-brand-gold" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-slate-200 line-clamp-1">{file.name}</p>
                      <p className="text-xs text-slate-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); removeFile(); }}
                      className="rounded-full p-2 hover:bg-slate-800 text-slate-400 hover:text-red-400 transition-colors"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="no-file"
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <Upload className="mx-auto h-8 w-8 text-slate-600 mb-3" />
                    <p className="text-sm text-slate-300">
                      <span className="text-brand-gold font-semibold">Click to upload</span> or drag and drop
                    </p>
                    <p className="mt-1 text-xs text-slate-500">Max file size: 25MB</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="col-span-full space-y-1.5">
            <label htmlFor="description" className="text-xs font-semibold uppercase tracking-wider text-slate-500">Project Description</label>
            <textarea
              required
              id="description"
              rows={4}
              placeholder="Tell us about the dimensions, usage, and any specific tolerances required..."
              className="w-full resize-none rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-3 text-slate-100 placeholder:text-slate-600 focus:border-brand-gold/50 focus:outline-none focus:ring-1 focus:ring-brand-gold/50 transition-all font-light"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          <div className="col-span-full pt-4">
            <button
              disabled={state === "submitting"}
              type="submit"
              className="group relative flex w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-brand-gold px-8 py-4 text-sm font-bold text-slate-950 transition-all hover:bg-brand-gold-bright active:scale-95 disabled:opacity-70"
            >
              {state === "submitting" ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Processing Design...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  Send to the Forge
                </>
              )}
            </button>
            <p className="mt-4 text-center text-[10px] text-slate-500 uppercase tracking-widest leading-relaxed">
              Your designs are safe with us. <br />
              Secure and private project handling.
            </p>
          </div>
        </form>

        {/* Decorative elements */}
        <div className="absolute -left-12 -top-12 h-40 w-40 rounded-full bg-brand-gold/5 blur-[60px] pointer-events-none" />
        <div className="absolute -right-12 -bottom-12 h-40 w-40 rounded-full bg-blue-500/5 blur-[60px] pointer-events-none" />
      </div>
    </motion.div>
  );
}
