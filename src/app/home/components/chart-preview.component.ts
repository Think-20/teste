import { Component, Input } from '@angular/core';
import { MatDialog } from '@angular/material';
import { ChartOptions } from '../home.component';

@Component({
  selector: 'cb-chart-preview',
  templateUrl: './chart-preview.component.html',
  styleUrls: ['./chart-preview.component.css']
})
export class ChartPreviewComponent {
  @Input() chartOptions: any;
  @Input() chartType: number;
  @Input() title: string;
  EChartType = EChartType;

  chartOptionsDonut: Partial<ChartOptions> = {
    series: [44, 55, 41, 17],
    chart: {
      width: 500,
      type: "donut",
    },
    stroke: {
      width: 0
    },
    legend: {
      position: "left",
      markers: {
        radius: 0,
        height: 10,

      }
    },
    plotOptions: {
      pie: {
        donut: {
          size: "80%",
          labels: {
            show: true,
            total: {
              showAlways: true,
              show: true,
              fontSize: "120px",
              fontFamily: "-apple-system,BlinkMacSystemFont, Segoe UI ,Roboto, Helvetica Neue,Arial,sans-serif",
              color: "#57585a",
              fontWeight: "300",
              formatter: (a) => "1.200.000",
              label: '103'
            },
            value: {
              fontFamily: "-apple-system,BlinkMacSystemFont, Segoe UI ,Roboto, Helvetica Neue,Arial,sans-serif",
              color: "#57585a",
              fontWeight: "100",
              fontSize: "30px",
              offsetY: 50,
            },
            name : {
              offsetY: 20
            }
          }
        }
      }
    },
    labels: ["Cenografia", "Stand", "PDV", "Showrooms", 'Outsiders'],
    colors: ["#adca5f", "#e82489", "#4fa2b1", "#00abeb", "#ffcd37"],
    dataLabels: {
      enabled: false
    },
    responsive: [
      {
        breakpoint: 480,
        options: {
          chart: {
            width: 200
          },
          legend: {
            position: "bottom"
          }
        }
      }
    ]
  };


  chartOptionsLine = {
    series: [
      {
        name: "High - 2013",
        data: [28, 29, 33, 30, 45, 68, 68, 43, 42, 55, 33, 33],
      },
      {
        name: "Low - 2013",
        data: [12, 20, 25, 60, 32, 20, 10, 50, 25, 33, 33, 33]
      }
    ],
    chart: {
      height: 400,
      width: 1000,
      type: "line",
      toolbar: {
        show: false
      }
    },
    grid: {
      borderColor: "#fff", // Cor das bordas da grade
      position: "back", // Coloca a grade atrás do gráfico
      xaxis: {
        lines: {
          show: true,
        },
      },
      yaxis: {
        lines: {
          show: true,
        },
      },
    },
    colors: ["#77B6EA", "#545454"],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      curve: "straight",
      width: [2, 4]
    },
    markers: {
      size: 1
    },
    xaxis: {
      categories: ["Jan 23", "Fev 23", "Mar 23", "Abr 23", "Mai 23", "Jun 23", "Jul 23", "Ago 23", "Set 23", "Out 23", "Nov 23", "Dez 23"],
    },
    yaxis: {
      show: false,
    },
    legend: {
      show: false
    }
  };

  constructor(public dialog: MatDialog) { }
}

export enum EChartType {
  DONUT = 1,
  LINE = 2
}