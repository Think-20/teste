export interface Memory {
    id: number;
    message: string;
    read: number;
}

export interface MemoryGroup  {
    [groupName: string]: Memory[];
}