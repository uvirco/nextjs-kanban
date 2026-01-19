/**
 * Storage Service - Abstraction layer for file storage
 * Supports multiple backends: Supabase Storage, Local Filesystem
 * Switch via STORAGE_TYPE env var
 */

import { supabaseAdmin } from "./supabase";
import { promises as fs } from "fs";
import path from "path";

export interface StorageUploadOptions {
  contentType?: string;
  cacheControl?: string;
  upsert?: boolean;
}

export interface StorageUploadResult {
  path: string;
  error?: any;
}

export interface StorageDeleteResult {
  error?: any;
}

export interface StorageAdapter {
  upload(
    filePath: string,
    file: Buffer,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult>;
  
  delete(paths: string[]): Promise<StorageDeleteResult>;
  
  getPublicUrl(filePath: string): string;
  
  getBucket(): string;
}

/**
 * Supabase Storage Adapter
 */
class SupabaseStorageAdapter implements StorageAdapter {
  private bucket: string;

  constructor(bucket: string = "attachments") {
    this.bucket = bucket;
  }

  async upload(
    filePath: string,
    file: Buffer,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    const { error } = await supabaseAdmin.storage
      .from(this.bucket)
      .upload(filePath, file, {
        contentType: options?.contentType,
        cacheControl: options?.cacheControl || "3600",
        upsert: options?.upsert || false,
      });

    if (error) {
      console.error("Supabase upload error:", error);
      return { path: filePath, error };
    }

    return { path: filePath };
  }

  async delete(paths: string[]): Promise<StorageDeleteResult> {
    const { error } = await supabaseAdmin.storage
      .from(this.bucket)
      .remove(paths);

    if (error) {
      console.error("Supabase delete error:", error);
      return { error };
    }

    return {};
  }

  getPublicUrl(filePath: string): string {
    const { data } = supabaseAdmin.storage
      .from(this.bucket)
      .getPublicUrl(filePath);
    
    return data.publicUrl;
  }

  getBucket(): string {
    return this.bucket;
  }
}

/**
 * Local Filesystem Storage Adapter
 */
class LocalStorageAdapter implements StorageAdapter {
  private basePath: string;
  private baseUrl: string;

  constructor() {
    this.basePath = process.env.STORAGE_PATH || "./storage/attachments";
    this.baseUrl = process.env.STORAGE_BASE_URL || "/api/storage";
  }

  async upload(
    filePath: string,
    file: Buffer,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    try {
      const fullPath = path.join(this.basePath, filePath);
      const dir = path.dirname(fullPath);

      // Create directory if it doesn't exist
      await fs.mkdir(dir, { recursive: true });

      // Write file
      await fs.writeFile(fullPath, new Uint8Array(file));

      return { path: filePath };
    } catch (error) {
      console.error("Local upload error:", error);
      return { path: filePath, error };
    }
  }

  async delete(paths: string[]): Promise<StorageDeleteResult> {
    try {
      await Promise.all(
        paths.map(async (p) => {
          const fullPath = path.join(this.basePath, p);
          try {
            await fs.unlink(fullPath);
          } catch (err: any) {
            if (err.code !== "ENOENT") {
              throw err;
            }
          }
        })
      );
      return {};
    } catch (error) {
      console.error("Local delete error:", error);
      return { error };
    }
  }

  getPublicUrl(filePath: string): string {
    // Returns API route URL that will serve the file
    return `${this.baseUrl}/${filePath}`;
  }

  getBucket(): string {
    return this.basePath;
  }

  // Helper method for API route to serve files
  async readFile(filePath: string): Promise<Buffer | null> {
    try {
      const fullPath = path.join(this.basePath, filePath);
      return await fs.readFile(fullPath);
    } catch (error) {
      console.error("Local read error:", error);
      return null;
    }
  }
}

/**
 * Storage Service Factory
 * Set STORAGE_TYPE=local to use local filesystem
 * Defaults to Supabase Storage
 */
class StorageService {
  private adapter: StorageAdapter;
  private type: string;

  constructor() {
    this.type = process.env.STORAGE_TYPE || "supabase";
    
    if (this.type === "local") {
      this.adapter = new LocalStorageAdapter();
      console.log("📁 Storage: Local Filesystem");
    } else {
      this.adapter = new SupabaseStorageAdapter();
      console.log("☁️  Storage: Supabase");
    }
  }

  async upload(
    filePath: string,
    file: Buffer,
    options?: StorageUploadOptions
  ): Promise<StorageUploadResult> {
    return this.adapter.upload(filePath, file, options);
  }

  async delete(paths: string[]): Promise<StorageDeleteResult> {
    return this.adapter.delete(paths);
  }

  getPublicUrl(filePath: string): string {
    return this.adapter.getPublicUrl(filePath);
  }

  getBucket(): string {
    return this.adapter.getBucket();
  }

  getType(): string {
    return this.type;
  }

  // Only available for local storage
  async readFile(filePath: string): Promise<Buffer | null> {
    if (this.adapter instanceof LocalStorageAdapter) {
      return this.adapter.readFile(filePath);
    }
    throw new Error("readFile only available for local storage");
  }
}

// Export singleton instance
export const storage = new StorageService();
