import { Injectable } from "@angular/core";
import {
  BaseRequestOptions,
  RequestOptionsArgs,
  RequestOptions,
} from "@angular/http";
import { ReceitaFederalService } from "app/shared/services/external-apis/receita-federal.service";
import { ViaCepService } from "app/shared/services/external-apis/viacep.service";

@Injectable()
export class RequestOptionsApiService extends BaseRequestOptions {
  constructor() {
    super();
    this.headers.set("Content-Type", "application/json");
  }

  merge(options?: RequestOptionsArgs): RequestOptions {
    const newOptions = super.merge(options);

    if (options && options.url && this.isExternalApi(options.url)) {
      return newOptions;
    }

    let user = JSON.parse(localStorage.getItem("currentUser")) || "";
    let token = localStorage.getItem("token") || "";

    newOptions.headers.set("Authorization", `${token}`);
    newOptions.headers.set("User", `${user.id}`);

    return newOptions;
  }

  private isExternalApi(url: string): boolean {
    const externalApis = [ViaCepService.api];

    return externalApis.some((api) => url.includes(api));
  }
}
