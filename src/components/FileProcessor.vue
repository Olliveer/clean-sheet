<script setup lang="ts">
import { ref } from "vue";
import * as XLSX from "xlsx";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { UploadCloudIcon } from "lucide-vue-next";
import { useConfigStore } from "@/stores/config";
import { decrypt } from "@/lib/utils";
const file = ref<File | null>(null);
const processing = ref(false);
const error = ref<string | null>(null);
const dragOver = ref(false);
const columnsToDecrypt = ref<string[]>(["accountName"]);
const availableColumns = ref<string[]>([]);

const configStore = useConfigStore();
const processedData = ref<any[]>([]);

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files.length > 0) {
    file.value = target.files[0];
    error.value = null;
    await extractColumns();
  }
};

const handleDrop = async (event: DragEvent) => {
  event.preventDefault();
  dragOver.value = false;

  const droppedFiles = event.dataTransfer?.files;
  if (droppedFiles && droppedFiles.length > 0) {
    const droppedFile = droppedFiles[0];
    if (
      droppedFile.type ===
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      droppedFile.type === "text/csv"
    ) {
      file.value = droppedFile;
      error.value = null;
      await extractColumns();
    } else {
      error.value = "Please upload a valid Excel or CSV file";
    }
  }
};

const handleDragOver = (event: DragEvent) => {
  event.preventDefault();
  dragOver.value = true;
};

const handleDragLeave = (event: DragEvent) => {
  event.preventDefault();
  dragOver.value = false;
};

const extractColumns = async () => {
  if (!file.value) return;

  try {
    const fileData = await file.value.arrayBuffer();
    const workbook = XLSX.read(fileData);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet);

    if (data.length > 0) {
      availableColumns.value = Object.keys(data[0] as Record<string, string>);
      columnsToDecrypt.value = []; // Reset selected columns
    }
  } catch (err) {
    error.value =
      "Error reading file columns: " +
      (err instanceof Error ? err.message : String(err));
  }
};

const processFile = async () => {
  if (!file.value) {
    error.value = "Please select a file first";
    return;
  }

  if (!configStore.state.key || !configStore.state.vector) {
    error.value = "Please set the key and vector first";
    return;
  }

  try {
    processing.value = true;
    error.value = null;

    const fileData = await file.value.arrayBuffer();
    const workbook = XLSX.read(fileData);

    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = XLSX.utils.sheet_to_json(firstSheet);

    // Decrypt the data - wait for all decryption operations to complete
    await Promise.all(
      data.map(async (row: any) => {
        // Decrypt all specified columns
        await Promise.all(
          columnsToDecrypt.value.map(async (column) => {
            if (row[column]) {
              row[column] = await decrypt(
                row[column],
                configStore.state.key,
                configStore.state.vector
              );
            }
          })
        );

        // Convert Excel date number to JavaScript Date if initialDateTime exists
        if (row.initialDateTime && typeof row.initialDateTime === "number") {
          try {
            const excelEpoch = new Date(Date.UTC(1899, 11, 30));
            const daysToAdd = row.initialDateTime;
            const millisToAdd = Math.round(
              (daysToAdd - Math.floor(daysToAdd)) * 86400000
            );
            const date = new Date(
              excelEpoch.getTime() +
                Math.floor(daysToAdd) * 86400000 +
                millisToAdd
            );

            if (!isNaN(date.getTime())) {
              row.initialDateTime = date.toISOString();
            }
          } catch (dateError) {
            console.warn("Error converting date:", dateError);
            // Keep the original value if conversion fails
          }
        }
      })
    );

    processedData.value = data;

    // Create a new workbook with processed data
    const newWorkbook = XLSX.utils.book_new();
    const newSheet = XLSX.utils.json_to_sheet(data);
    XLSX.utils.book_append_sheet(newWorkbook, newSheet, "Processed Data");

    // Generate and download the file
    XLSX.writeFile(newWorkbook, "processed_data_clean_sheet.xlsx");
  } catch (err) {
    error.value =
      "Error processing file: " +
      (err instanceof Error ? err.message : String(err));
    processedData.value = [];
  } finally {
    processing.value = false;
  }
};
</script>

<template>
  <Card>
    <CardHeader>
      <CardTitle>Upload File</CardTitle>
      <CardDescription> Upload a CSV or XLSX file to process </CardDescription>
    </CardHeader>
    <CardContent>
      <div class="space-y-4">
        <div
          class="relative border-2 border-dashed rounded-lg p-8 transition-colors"
          :class="{
            'border-primary/50 bg-primary/5': dragOver,
            'border-muted-foreground/25': !dragOver,
          }"
          @drop="handleDrop"
          @dragover="handleDragOver"
          @dragleave="handleDragLeave"
        >
          <input
            type="file"
            accept=".csv,.xlsx"
            @change="handleFileChange"
            :disabled="processing"
            class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          />
          <div class="text-center">
            <UploadCloudIcon class="mx-auto h-12 w-12 text-muted-foreground" />
            <div class="mt-4 text-sm text-muted-foreground">
              <span class="font-semibold">Click to upload</span> or drag and
              drop
            </div>
            <div class="mt-2 text-xs text-muted-foreground">
              CSV or XLSX files only
            </div>
            <div
              v-if="file"
              class="mt-4 text-sm font-medium text-primary"
            >
              Selected: {{ file.name }}
            </div>
          </div>
        </div>

        <div
          v-if="availableColumns.length > 0"
          class="space-y-2"
        >
          <label class="text-sm font-medium">Select columns to decrypt:</label>
          <div class="grid grid-cols-2 gap-2">
            <div
              v-for="column in availableColumns"
              :key="column"
              class="flex items-center gap-2"
            >
              <input
                type="checkbox"
                :id="column"
                :value="column"
                v-model="columnsToDecrypt"
                class="h-4 w-4 rounded border-primary text-primary shadow focus:ring-primary focus:ring-offset-background disabled:cursor-not-allowed disabled:opacity-50 bg-background"
              />
              <Label
                :for="column"
                class="text-sm"
              >
                {{ column }}
              </Label>
            </div>
          </div>
        </div>

        <div
          v-if="error"
          class="text-sm text-destructive"
        >
          {{ error }}
        </div>

        <Button
          @click="processFile"
          :disabled="!file || processing"
          class="w-full"
        >
          {{ processing ? "Processing..." : "Process File" }}
        </Button>
      </div>
    </CardContent>
  </Card>
</template>
