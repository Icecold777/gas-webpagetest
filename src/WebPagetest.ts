import * as queryString from 'querystring'
import Utils = require('./Utils')
import 'core-js/modules/es.array.fill'

type TestResult = {
  completed: number
  date: Date
  firstByte: number
  firstLayout: number
  firstPaint: number
  firstContentfulPaint: number
  firstMeaningfulPaint: number
  speedIndex: number
  domInteractive: number
  loadTime: number
  visualComplete: number
  fullyLoaded: number
  timeToInteractive: number
  breakdown: any
  summary: any
  finalURL: string
  browserName: string
  browserVersion: string
  visualComplete85: number
  visualComplete90: number
  visualComplete95: number
  visualComplete99: number
  bytesOut: number
  bytesOutDoc: number
  bytesIn: number
  bytesInDoc: number
  connections: number
  requestsDoc: number
  responses_200: number
  responses_404: number
  responses_other: number
  firstByteRepeatView: number
  firstLayoutRepeatView: number
  firstPaintRepeatView: number
  firstContentfulPaintRepeatView: number
  firstMeaningfulPaintRepeatView: number
  speedIndexRepeatView: number
  domInteractiveRepeatView: number
  loadTimeRepeatView: number
  visualCompleteRepeatView: number
  fullyLoadedRepeatView: number
  firstInteractiveRepeatView: number
  lastInteractiveRepeatView: number
  timeToInteractiveRepeatView: number
  breakdownRepeatView: any
  visualComplete85RepeatView: number
  visualComplete90RepeatView: number
  visualComplete95RepeatView: number
  visualComplete99RepeatView: number
  bytesOutRepeatView: number
  bytesOutDocRepeatView: number
  bytesInRepeatView: number
  bytesInDocRepeatView: number
  connectionsRepeatView: number
  requestsDocRepeatView: number
  responses_200RepeatView: number
  responses_404RepeatView: number
  responses_otherRepeatView: number
}

class WebPagetest {
  /**
   * @param {type}    key - runTest するときは必須。
   * @param {type}    server - 省略すれば www.webpagetest.org
   */
  constructor(private key?: string, private server: string = 'https://www.webpagetest.org') {}

  /**
   * WebPagetest 実行
   *
   * @param {type}    url - this is the parameter url
   * @param {type}    options - this is the parameter options
   *
   * @return {} testId
   */
  public runTest(url: string, options?: Options): string | Error {
    try {
      const requestURL = this.generateRunTestURL(url, options)
      const response = Utils.fetch(requestURL)
      const {
        data: { testId },
      } = response
      return testId
    } catch (error) {
      return error
    }
  }

  public getTestStatus(testId: string): number | Error {
    try {
      const response = Utils.fetch(this.generateTestStatusURL(testId))
      const {
        data: { statusCode },
      } = response
      return statusCode
    } catch (error) {
      return error
    }
  }

  /**
   * テスト結果取得
   *
   * @param testId - this is the parameter testId
   * @returns {string[]|Error} response data
   */
  public getTestResults(testId) {
    // 空文字は無視する
    if (testId.length === 0) {
      return this.createEmptyTestResults()
    }

    const statusCode = this.getTestStatus(testId)
    if (statusCode instanceof Error) {
      return statusCode // Return Error object
    }
    if (statusCode !== 200) {
      return this.createEmptyTestResults()
    }

    const requestURL = this.generateTestResultsURL(testId)
    const response = Utils.fetch(requestURL)
    return this.generateTestResultValues(this.convertWebPageResponseToResult(response))
  }

  /**
   * Return empty row data
   */
  public createEmptyTestResults() {
    return new Array(this.countOfResults()).fill('')
  }

  public test = this.runTest
  public results = this.getTestResults

  /**
   * WebPagetest 実行用 URL 生成
   *
   * @param {type}    url - 必須。
   * @param {type}    options - 省略可能。
   *
   * @return {String} URL
   */
  public generateRunTestURL(url: string, options: Options = {}): string {
    const apiEndpoint = `${this.server}/runtest.php`
    const query = queryString.stringify({
      ...{
        url: url,
        location: options.location || 'ec2-ap-northeast-1.3GFast',
        runs: options.runs !== undefined ? options.runs : 1,
        fvonly: options.fvonly !== undefined ? options.fvonly : 1,
        video: options.video !== undefined ? options.video : 1,
        f: options.format || 'JSON',
        noopt: options.noOptimization !== undefined ? options.noOptimization : 1,
        k: this.key,
        mobile: options.mobile !== undefined ? options.mobile : 1,
        mobileDevice: options.mobileDevice || 'Pixel',
        lighthouse: options.lighthouse !== undefined ? options.lighthouse : 1,
      },
      // omit script if does not pass options.script
      ...(options.script
        ? {
            script: options.script,
          }
        : {}),
    })
    return `${apiEndpoint}?${query}`
  }

  /**
   * WebPagetestのresponseからTestResultオブジェクトに変換します
   * @param response
   */
  public convertWebPageResponseToResult(response: any): TestResult {
    const {
      data: {
        completed,
        median: {
          firstView: {
            TTFB: firstByte,
            firstLayout,
            firstPaint,
            firstContentfulPaint,
            firstMeaningfulPaint,
            SpeedIndex: speedIndex,
            domInteractive,
            loadTime,
            visualComplete,
            fullyLoaded,
            FirstInteractive: firstInteractive,
            LastInteractive: lastInteractive,
            'lighthouse.Performance.interactive': timeToInteractive,
            breakdown,
            final_url: finalURL,
            browser_name: browserName,
            browserVersion,
            visualComplete85,
            visualComplete90,
            visualComplete95,
            visualComplete99,
            bytesOut,
            bytesOutDoc,
            bytesIn,
            bytesInDoc,
            connections,
            requestsDoc,
            responses_200,
            responses_404,
            responses_other,
          },
          repeatView: {
            TTFB: firstByteRepeatView,
            firstLayout: firstLayoutRepeatView,
            firstPaint: firstPaintRepeatView,
            firstContentfulPaint: firstContentfulPaintRepeatView,
            firstMeaningfulPaint: firstMeaningfulPaintRepeatView,
            SpeedIndex: speedIndexRepeatView,
            domInteractive: domInteractiveRepeatView,
            loadTime: loadTimeRepeatView,
            visualComplete: visualCompleteRepeatView,
            fullyLoaded: fullyLoadedRepeatView,
            FirstInteractive: firstInteractiveRepeatView,
            LastInteractive: lastInteractiveRepeatView,
            'lighthouse.Performance.interactive': timeToInteractiveRepeatView,
            breakdown: breakdownRepeatView,
            visualComplete85: visualComplete85RepeatView,
            visualComplete90: visualComplete90RepeatView,
            visualComplete95: visualComplete95RepeatView,
            visualComplete99: visualComplete99RepeatView,
            bytesOut: bytesOutRepeatView,
            bytesOutDoc: bytesOutDocRepeatView,
            bytesIn: bytesInRepeatView,
            bytesInDoc: bytesInDocRepeatView,
            connections: connectionsRepeatView,
            requestsDoc: requestsDocRepeatView,
            responses_200: responses_200RepeatView,
            responses_404: responses_404RepeatView,
            responses_other: responses_otherRepeatView,
          },
        },
        summary,
      },
    } = response

    const date = new Date(completed * 1000)
    return {
      completed,
      date,
      firstByte,
      firstLayout,
      firstPaint,
      firstContentfulPaint,
      firstMeaningfulPaint,
      speedIndex,
      domInteractive,
      loadTime,
      visualComplete,
      fullyLoaded,
      // 5 秒のアイドル時間がないと FirstInteractive は測定できないので、その場合は LastInteractive を見るのが WPT の仕様
      // リージョンや過去のテストなど FirstInteractive / LastInteractive が存在しない場合もあるので、ない場合は Lighthouse の TTI を見る
      // - https://github.com/WPO-Foundation/webpagetest/issues/1162#issuecomment-404304316
      // - https://github.com/WPO-Foundation/webpagetest/issues/1229#issuecomment-446710842
      timeToInteractive: firstInteractive || lastInteractive || timeToInteractive,
      breakdown,
      summary,
      finalURL,
      browserName,
      browserVersion,
      visualComplete85,
      visualComplete90,
      visualComplete95,
      visualComplete99,
      bytesOut,
      bytesOutDoc,
      bytesIn,
      bytesInDoc,
      connections,
      requestsDoc,
      responses_200,
      responses_404,
      responses_other,
      firstByteRepeatView,
      firstLayoutRepeatView,
      firstPaintRepeatView,
      firstContentfulPaintRepeatView,
      firstMeaningfulPaintRepeatView,
      speedIndexRepeatView,
      domInteractiveRepeatView,
      loadTimeRepeatView,
      visualCompleteRepeatView,
      fullyLoadedRepeatView,
      firstInteractiveRepeatView,
      lastInteractiveRepeatView,
      timeToInteractiveRepeatView:
        firstInteractiveRepeatView || lastInteractiveRepeatView || timeToInteractiveRepeatView,
      breakdownRepeatView,
      visualComplete85RepeatView,
      visualComplete90RepeatView,
      visualComplete95RepeatView,
      visualComplete99RepeatView,
      bytesOutRepeatView,
      bytesOutDocRepeatView,
      bytesInRepeatView,
      bytesInDocRepeatView,
      connectionsRepeatView,
      requestsDocRepeatView,
      responses_200RepeatView,
      responses_404RepeatView,
      responses_otherRepeatView,
    }
  }

  public countOfResults() {
    return this.generateResultMapping().length
  }

  public generateTestResultNames() {
    return this.generateResultMapping().map(map => {
      return map.name
    })
  }

  public generateTestResultValues(result: TestResult) {
    return this.generateResultMapping().map(map => {
      return map.value(result)
    })
  }

  private generateResultMapping() {
    return [
      {
        name: 'completedTimeStamp',
        value: (result: TestResult) => result.completed,
      },
      {
        name: 'yyyyMMddHH',
        value: (result: TestResult) => Utilities.formatDate(result.date, 'GMT+9', 'yyyyMMddHH'),
      },
      {
        name: 'yyyyMMdd',
        value: (result: TestResult) => Utilities.formatDate(result.date, 'GMT+9', 'yyyyMMdd'),
      },
      {
        name: 'firstByte',
        value: (result: TestResult) => Utils.transform(result.firstByte),
      },
      {
        name: 'firstLayout',
        value: (result: TestResult) => Utils.transform(result.firstLayout),
      },
      {
        name: 'firstPaint',
        value: (result: TestResult) => Utils.transform(result.firstPaint),
      },
      {
        name: 'firstContentfulPaint',
        value: (result: TestResult) => Utils.transform(result.firstContentfulPaint),
      },
      {
        name: 'firstMeaningfulPaint',
        value: (result: TestResult) => Utils.transform(result.firstMeaningfulPaint),
      },
      {
        name: 'speedIndex',
        value: (result: TestResult) => Utils.transform(result.speedIndex),
      },
      {
        name: 'domInteractive',
        value: (result: TestResult) => Utils.transform(result.domInteractive),
      },
      {
        name: 'loadTime',
        value: (result: TestResult) => Utils.transform(result.loadTime),
      },
      {
        name: 'visualComplete',
        value: (result: TestResult) => Utils.transform(result.visualComplete),
      },
      {
        name: 'fullyLoaded',
        value: (result: TestResult) => Utils.transform(result.fullyLoaded),
      },
      {
        name: 'timeToInteractive',
        value: (result: TestResult) => Utils.transform(result.timeToInteractive),
      },
      {
        name: 'html.bytes',
        value: (result: TestResult) => Utils.transform(result.breakdown.html.bytes, 1),
      },
      {
        name: 'html.requests',
        value: (result: TestResult) => result.breakdown.html.requests,
      },
      {
        name: 'js.bytes',
        value: (result: TestResult) => Utils.transform(result.breakdown.js.bytes, 1),
      },
      {
        name: 'js.requests',
        value: (result: TestResult) => result.breakdown.js.requests,
      },
      {
        name: 'css.bytes',
        value: (result: TestResult) => Utils.transform(result.breakdown.css.bytes, 1),
      },
      {
        name: 'css.requests',
        value: (result: TestResult) => result.breakdown.css.requests,
      },
      {
        name: 'image.bytes',
        value: (result: TestResult) => Utils.transform(result.breakdown.image.bytes, 1),
      },
      {
        name: 'image.requests',
        value: (result: TestResult) => result.breakdown.image.requests,
      },
      {
        name: 'font.bytes',
        value: (result: TestResult) => Utils.transform(result.breakdown.font.bytes, 1),
      },
      {
        name: 'font.requests',
        value: (result: TestResult) => result.breakdown.font.requests,
      },
      {
        name: 'flash.bytes',
        value: (result: TestResult) => Utils.transform(result.breakdown.flash.bytes, 1),
      },
      {
        name: 'flash.requests',
        value: (result: TestResult) => result.breakdown.flash.requests,
      },
      {
        name: 'video.bytes',
        value: (result: TestResult) => Utils.transform(result.breakdown.video.bytes, 1),
      },
      {
        name: 'video.requests',
        value: (result: TestResult) => result.breakdown.video.requests,
      },
      {
        name: 'other.bytes',
        value: (result: TestResult) => Utils.transform(result.breakdown.other.bytes, 1),
      },
      {
        name: 'other.requests',
        value: (result: TestResult) => result.breakdown.other.requests,
      },
      {
        name: 'summary',
        value: (result: TestResult) => result.summary,
      },
      {
        name: 'finalURL',
        value: (result: TestResult) => result.finalURL,
      },
      {
        name: 'browserName',
        value: (result: TestResult) => result.browserName,
      },
      {
        name: 'browserVersion',
        value: (result: TestResult) => result.browserVersion,
      },
      {
        name: 'visualComplete85',
        value: (result: TestResult) => Utils.transform(result.visualComplete85, 1),
      },
      {
        name: 'visualComplete90',
        value: (result: TestResult) => Utils.transform(result.visualComplete90, 1),
      },
      {
        name: 'visualComplete95',
        value: (result: TestResult) => Utils.transform(result.visualComplete95, 1),
      },
      {
        name: 'visualComplete99',
        value: (result: TestResult) => Utils.transform(result.visualComplete99, 1),
      },
      {
        name: 'bytesOut',
        value: (result: TestResult) => Utils.transform(result.bytesOut, 1),
      },
      {
        name: 'bytesOutDoc',
        value: (result: TestResult) => Utils.transform(result.bytesOutDoc, 1),
      },
      {
        name: 'bytesIn',
        value: (result: TestResult) => Utils.transform(result.bytesIn, 1),
      },
      {
        name: 'bytesInDoc',
        value: (result: TestResult) => Utils.transform(result.bytesInDoc, 1),
      },
      {
        name: 'connections',
        value: (result: TestResult) => result.connections,
      },
      {
        name: 'requestsDoc',
        value: (result: TestResult) => result.requestsDoc,
      },
      {
        name: 'responses_200',
        value: (result: TestResult) => result.responses_200,
      },
      {
        name: 'responses_404',
        value: (result: TestResult) => result.responses_404,
      },
      {
        name: 'responses_other',
        value: (result: TestResult) => result.responses_other,
      },
      {
        name: 'firstByteRepeatView',
        value: (result: TestResult) => Utils.transform(result.firstByteRepeatView),
      },
      {
        name: 'firstLayoutRepeatView',
        value: (result: TestResult) => Utils.transform(result.firstLayoutRepeatView),
      },
      {
        name: 'firstPaintRepeatView',
        value: (result: TestResult) => Utils.transform(result.firstPaintRepeatView),
      },
      {
        name: 'firstContentfulPaintRepeatView',
        value: (result: TestResult) => Utils.transform(result.firstContentfulPaintRepeatView),
      },
      {
        name: 'firstMeaningfulPaintRepeatView',
        value: (result: TestResult) => Utils.transform(result.firstMeaningfulPaintRepeatView),
      },
      {
        name: 'speedIndexRepeatView',
        value: (result: TestResult) => Utils.transform(result.speedIndexRepeatView),
      },
      {
        name: 'domInteractiveRepeatView',
        value: (result: TestResult) => Utils.transform(result.domInteractiveRepeatView),
      },
      {
        name: 'loadTimeRepeatView',
        value: (result: TestResult) => Utils.transform(result.loadTimeRepeatView),
      },
      {
        name: 'visualCompleteRepeatView',
        value: (result: TestResult) => Utils.transform(result.visualCompleteRepeatView),
      },
      {
        name: 'fullyLoadedRepeatView',
        value: (result: TestResult) => Utils.transform(result.fullyLoadedRepeatView),
      },
      {
        name: 'timeToInteractiveRepeatView',
        value: (result: TestResult) => Utils.transform(result.timeToInteractiveRepeatView),
      },
      {
        name: 'html.bytesRepeatView',
        value: (result: TestResult) => Utils.transform(result.breakdownRepeatView.html.bytes, 1),
      },
      {
        name: 'html.requestsRepeatView',
        value: (result: TestResult) => result.breakdownRepeatView.html.requests,
      },
      {
        name: 'js.bytesRepeatView',
        value: (result: TestResult) => Utils.transform(result.breakdownRepeatView.js.bytes, 1),
      },
      {
        name: 'js.requestsRepeatView',
        value: (result: TestResult) => result.breakdownRepeatView.js.requests,
      },
      {
        name: 'css.bytesRepeatView',
        value: (result: TestResult) => Utils.transform(result.breakdownRepeatView.css.bytes, 1),
      },
      {
        name: 'css.requestsRepeatView',
        value: (result: TestResult) => result.breakdownRepeatView.css.requests,
      },
      {
        name: 'image.bytes',
        value: (result: TestResult) => Utils.transform(result.breakdown.image.bytes, 1),
      },
      {
        name: 'image.requests',
        value: (result: TestResult) => result.breakdown.image.requests,
      },
      {
        name: 'font.bytesRepeatView',
        value: (result: TestResult) => Utils.transform(result.breakdownRepeatView.font.bytes, 1),
      },
      {
        name: 'font.requestsRepeatView',
        value: (result: TestResult) => result.breakdownRepeatView.font.requests,
      },
      {
        name: 'flash.bytesRepeatView',
        value: (result: TestResult) => Utils.transform(result.breakdownRepeatView.flash.bytes, 1),
      },
      {
        name: 'flash.requestsRepeatView',
        value: (result: TestResult) => result.breakdownRepeatView.flash.requests,
      },
      {
        name: 'video.bytesRepeatView',
        value: (result: TestResult) => Utils.transform(result.breakdownRepeatView.video.bytes, 1),
      },
      {
        name: 'video.requestsRepeatView',
        value: (result: TestResult) => result.breakdownRepeatView.video.requests,
      },
      {
        name: 'other.bytesRepeatView',
        value: (result: TestResult) => Utils.transform(result.breakdownRepeatView.other.bytes, 1),
      },
      {
        name: 'other.requestsRepeatView',
        value: (result: TestResult) => result.breakdownRepeatView.other.requests,
      },
      {
        name: 'visualComplete85RepeatView',
        value: (result: TestResult) => Utils.transform(result.visualComplete85RepeatView, 1),
      },
      {
        name: 'visualComplete90RepeatView',
        value: (result: TestResult) => Utils.transform(result.visualComplete90RepeatView, 1),
      },
      {
        name: 'visualComplete95RepeatView',
        value: (result: TestResult) => Utils.transform(result.visualComplete95RepeatView, 1),
      },
      {
        name: 'visualComplete99RepeatView',
        value: (result: TestResult) => Utils.transform(result.visualComplete99RepeatView, 1),
      },
      {
        name: 'bytesOutRepeatView',
        value: (result: TestResult) => Utils.transform(result.bytesOutRepeatView, 1),
      },
      {
        name: 'bytesOutDocRepeatView',
        value: (result: TestResult) => Utils.transform(result.bytesOutDocRepeatView, 1),
      },
      {
        name: 'bytesInRepeatView',
        value: (result: TestResult) => Utils.transform(result.bytesInRepeatView, 1),
      },
      {
        name: 'bytesInDocRepeatView',
        value: (result: TestResult) => Utils.transform(result.bytesInDocRepeatView, 1),
      },
      {
        name: 'connectionsRepeatView',
        value: (result: TestResult) => result.connectionsRepeatView,
      },
      {
        name: 'requestsDocRepeatView',
        value: (result: TestResult) => result.requestsDocRepeatView,
      },
      {
        name: 'responses_200RepeatView',
        value: (result: TestResult) => result.responses_200RepeatView,
      },
      {
        name: 'responses_404RepeatView',
        value: (result: TestResult) => result.responses_404RepeatView,
      },
      {
        name: 'responses_otherRepeatView',
        value: (result: TestResult) => result.responses_otherRepeatView,
      },
    ]
  }

  private generateTestStatusURL(testId: string) {
    return `${this.server}/testStatus.php?f=json&test=${testId}`
  }

  /**
   * WebPagetest 実行結果用 URL 生成
   *
   * @param {type}    testId - this is the parameter testId
   *
   * @return {String} URL
   */
  private generateTestResultsURL(testId: string) {
    return `${this.server}/jsonResult.php?test=${testId}&pagespeed=1`
  }
}

export = WebPagetest
