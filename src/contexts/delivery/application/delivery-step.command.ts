import { Command } from "@/packages/building-blocks/command";

export abstract class DeliveryStepCommand extends Command {
    abstract readonly tradeId: number;
}
