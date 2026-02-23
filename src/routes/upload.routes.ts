import { Elysia, t } from "elysia";
import { authGuard } from "../middleware/auth.guard";
import { storageService } from "../services/storage.service";
import { modelService } from "../services/model.service";
import { validate } from "../middleware/validation";
import { presignedUrlSchema, confirmUploadSchema } from "../types";
import { success } from "../utils/response";
import { ValidationError } from "../utils/error-handler";

const ALLOWED_EXTENSIONS = ["stl", "obj", "gltf", "glb", "3mf"];
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB

export const uploadRoutes = new Elysia({ prefix: "/upload" })
  .use(authGuard)
  .post(
    "/presigned-url",
    async ({ body, user }) => {
      const data = validate(presignedUrlSchema, body);

      // Validate file extension
      const ext = data.fileName.split(".").pop()?.toLowerCase();
      if (!ext || !ALLOWED_EXTENSIONS.includes(ext)) {
        throw new ValidationError(`Invalid file format. Allowed: ${ALLOWED_EXTENSIONS.join(", ")}`);
      }

      if (data.fileSize > MAX_FILE_SIZE) {
        throw new ValidationError("File size exceeds 100MB limit");
      }

      const key = storageService.generateKey(`uploads/${user.id}`, data.fileName);
      const { uploadUrl } = await storageService.getUploadUrl(key, data.fileType, data.fileSize);

      // Create a pending model record
      const formatMap: Record<string, string> = {
        stl: "STL",
        obj: "OBJ",
        gltf: "GLTF",
        glb: "GLB",
        "3mf": "THREE_MF",
      };

      const model = await modelService.create(
        {
          name: data.fileName.replace(/\.[^/.]+$/, ""),
          format: formatMap[ext] as "STL" | "OBJ" | "GLTF" | "GLB" | "THREE_MF",
          fileKey: key,
          fileSizeBytes: data.fileSize,
        },
        user.id
      );

      return success({ uploadUrl, key, modelId: model.id }, "Presigned URL generated");
    },
    {
      body: t.Object({
        fileName: t.String(),
        fileType: t.String(),
        fileSize: t.Number(),
      }),
    }
  )
  .post(
    "/confirm",
    async ({ body }) => {
      const data = validate(confirmUploadSchema, body);
      const model = await modelService.update(data.modelId, {
        dimensionX: data.dimensionX,
        dimensionY: data.dimensionY,
        dimensionZ: data.dimensionZ,
        volumeCm3: data.volumeCm3,
      });
      return success(model, "Upload confirmed");
    },
    {
      body: t.Object({
        modelId: t.String(),
        dimensionX: t.Optional(t.Number()),
        dimensionY: t.Optional(t.Number()),
        dimensionZ: t.Optional(t.Number()),
        volumeCm3: t.Optional(t.Number()),
      }),
    }
  );
