
/*jslint browser: true, node: true */
/*global */

"use strict";

/*** Imports ***/
var papaya = papaya || {};
papaya.viewer = papaya.viewer || {};


/*** Constructor ***/
papaya.viewer.ColorTable = papaya.viewer.ColorTable || function (lutName, baseImage, colorTable) {
    var lut = null;

    if (colorTable !== undefined) {
        lut = colorTable;
    } else {
        lut = papaya.viewer.ColorTable.findLUT(lutName);
    }

    this.lutData = lut.data;
    this.maxLUT = 0;
    this.minLUT = 0;
    this.knotThresholds = [];
    this.knotRangeRatios = [];

    this.LUTarrayG = new Array(256);
    this.LUTarrayR = new Array(256);
    this.LUTarrayB = new Array(256);
    this.isBaseImage = baseImage;

    this.knotMin = this.lutData[0];
    this.knotMax = this.lutData[this.lutData.length - 1];
    this.useGradation = (typeof lut.gradation === "undefined") || lut.gradation;

    this.updateLUT(papaya.viewer.ColorTable.LUT_MIN, papaya.viewer.ColorTable.LUT_MAX);
};


/*** Static Pseudo-constants ***/

papaya.viewer.ColorTable.TABLE_GRAYSCALE = {"name": "Grayscale", "data": [[0, 0, 0, 0], [1, 1, 1, 1]],
    "gradation": true};
papaya.viewer.ColorTable.TABLE_SPECTRUM = {"name": "Spectrum", "data": [[0, 0, 0, 0], [0.1, 0, 0, 1], [0.33, 0, 1, 1],
    [0.5, 0, 1, 0], [0.66, 1, 1, 0], [0.9, 1, 0, 0], [1, 1, 1, 1]], "gradation": true};
papaya.viewer.ColorTable.TABLE_AAASMO = {"name": "Aaasmo (Mayo Clinic)", "data": [[0,0,0,0],[0.0039216,0.13333,0,0.33333],[0.0078431,0.14118,0,0.33333],[0.011765,0.14902,0,0.33725],[0.015686,0.15686,0,0.33725],[0.019608,0.16078,0,0.34118],[0.023529,0.16863,0,0.34118],[0.027451,0.17647,0,0.3451],[0.031373,0.18431,0,0.3451],[0.035294,0.19216,0,0.34902],[0.039216,0.2,0,0.34902],[0.043137,0.20392,0,0.35294],[0.047059,0.21176,0,0.35294],[0.05098,0.21961,0,0.35686],[0.054902,0.22745,0,0.35686],[0.058824,0.23529,0,0.35686],[0.062745,0.24314,0,0.36078],[0.066667,0.24706,0,0.36078],[0.070588,0.2549,0,0.36471],[0.07451,0.26275,0,0.36471],[0.078431,0.27059,0,0.36863],[0.082353,0.27843,0,0.36863],[0.086275,0.28627,0,0.37255],[0.090196,0.2902,0,0.37255],[0.094118,0.29804,0,0.37647],[0.098039,0.30588,0,0.37647],[0.10196,0.31373,0,0.37647],[0.10588,0.32157,0,0.38039],[0.1098,0.32941,0,0.38039],[0.11373,0.33333,0,0.38431],[0.11765,0.34118,0,0.38431],[0.12157,0.34902,0,0.38824],[0.12549,0.35686,0,0.38824],[0.12941,0.36471,0,0.39216],[0.13333,0.37255,0,0.39216],[0.13725,0.37647,0,0.39608],[0.14118,0.38431,0,0.39608],[0.1451,0.39216,0,0.4],[0.14902,0.4,0,0.4],[0.15294,0.4,0,0.41569],[0.15686,0.4,0,0.43529],[0.16078,0.4,0,0.45098],[0.16471,0.4,0,0.46667],[0.16863,0.4,0,0.48235],[0.17255,0.4,0,0.50196],[0.17647,0.4,0,0.51765],[0.18039,0.4,0,0.53333],[0.18431,0.4,0,0.54902],[0.18824,0.4,0,0.56863],[0.19216,0.4,0,0.58431],[0.19608,0.4,0,0.6],[0.2,0.36863,0,0.61176],[0.20392,0.33725,0,0.61961],[0.20784,0.30588,0,0.63137],[0.21176,0.27843,0,0.63922],[0.21569,0.24706,0,0.65098],[0.21961,0.21569,0,0.66275],[0.22353,0.18431,0,0.67059],[0.22745,0.15294,0,0.68235],[0.23137,0.12157,0,0.69412],[0.23529,0.094118,0,0.70196],[0.23922,0.062745,0,0.71373],[0.24314,0.031373,0,0.72157],[0.24706,0,0,0.73333],[0.25098,0,0.023529,0.75686],[0.2549,0,0.043137,0.77647],[0.25882,0,0.066667,0.8],[0.26275,0,0.090196,0.82353],[0.26667,0,0.1098,0.84314],[0.27059,0,0.13333,0.86667],[0.27451,0,0.15686,0.8902],[0.27843,0,0.17647,0.9098],[0.28235,0,0.2,0.93333],[0.28627,0,0.22353,0.95686],[0.2902,0,0.24314,0.97647],[0.29412,0,0.26667,1],[0.29804,0,0.28235,0.98431],[0.30196,0,0.30196,0.96863],[0.30588,0,0.31765,0.94902],[0.3098,0,0.33333,0.93333],[0.31373,0,0.34902,0.91765],[0.31765,0,0.36863,0.90196],[0.32157,0,0.38431,0.88235],[0.32549,0,0.4,0.86667],[0.32941,0,0.41569,0.85098],[0.33333,0,0.43529,0.83529],[0.33725,0,0.45098,0.81569],[0.34118,0,0.46667,0.8],[0.3451,0,0.48235,0.78431],[0.34902,0,0.49412,0.77255],[0.35294,0,0.5098,0.75686],[0.35686,0,0.52549,0.74118],[0.36078,0,0.53725,0.72941],[0.36471,0,0.55294,0.71373],[0.36863,0,0.56863,0.70196],[0.37255,0,0.58039,0.68627],[0.37647,0,0.59608,0.67059],[0.38039,0,0.60784,0.65882],[0.38431,0,0.62353,0.64314],[0.38824,0,0.63922,0.62745],[0.39216,0,0.65098,0.61569],[0.39608,0,0.66667,0.6],[0.4,0,0.66667,0.54902],[0.40392,0,0.66667,0.50196],[0.40784,0,0.66667,0.45098],[0.41176,0,0.66667,0.4],[0.41569,0,0.66667,0.34902],[0.41961,0,0.66667,0.30196],[0.42353,0,0.66667,0.25098],[0.42745,0,0.66667,0.2],[0.43137,0,0.66667,0.14902],[0.43529,0,0.66667,0.10196],[0.43922,0,0.66667,0.05098],[0.44314,0,0.66667,0],[0.44706,0,0.68235,0],[0.45098,0,0.70196,0],[0.4549,0,0.71765,0],[0.45882,0,0.73333,0],[0.46275,0,0.74902,0],[0.46667,0,0.76863,0],[0.47059,0,0.78431,0],[0.47451,0,0.8,0],[0.47843,0,0.81569,0],[0.48235,0,0.83529,0],[0.48627,0,0.85098,0],[0.4902,0,0.86667,0],[0.49412,0.039216,0.87843,0],[0.49804,0.082353,0.88627,0],[0.50196,0.12157,0.89804,0],[0.50588,0.16471,0.90588,0],[0.5098,0.20392,0.91765,0],[0.51373,0.24706,0.92941,0],[0.51765,0.28627,0.93725,0],[0.52157,0.32941,0.94902,0],[0.52549,0.36863,0.96078,0],[0.52941,0.41176,0.96863,0],[0.53333,0.45098,0.98039,0],[0.53725,0.49412,0.98824,0],[0.54118,0.53333,1,0],[0.5451,0.55294,1,0],[0.54902,0.57255,1,0],[0.55294,0.59608,1,0],[0.55686,0.61569,1,0],[0.56078,0.63529,1,0],[0.56471,0.6549,1,0],[0.56863,0.67843,1,0],[0.57255,0.69804,1,0],[0.57647,0.71765,1,0],[0.58039,0.73725,1,0],[0.58431,0.76078,1,0],[0.58824,0.78039,1,0],[0.59216,0.8,1,0],[0.59608,0.81569,1,0],[0.6,0.83529,1,0],[0.60392,0.85098,1,0],[0.60784,0.86667,1,0],[0.61176,0.88235,1,0],[0.61569,0.90196,1,0],[0.61961,0.91765,1,0],[0.62353,0.93333,1,0],[0.62745,0.94902,1,0],[0.63137,0.96863,1,0],[0.63529,0.98431,1,0],[0.63922,1,1,0],[0.64314,1,0.99216,0],[0.64706,1,0.98431,0],[0.65098,1,0.97647,0],[0.6549,1,0.96863,0],[0.65882,1,0.96078,0],[0.66275,1,0.95294,0],[0.66667,1,0.9451,0],[0.67059,1,0.93725,0],[0.67451,1,0.92941,0],[0.67843,1,0.92157,0],[0.68235,1,0.91373,0],[0.68627,1,0.90588,0],[0.6902,1,0.89412,0],[0.69412,1,0.88627,0],[0.69804,1,0.87843,0],[0.70196,1,0.87059,0],[0.70588,1,0.86275,0],[0.7098,1,0.8549,0],[0.71373,1,0.84706,0],[0.71765,1,0.83922,0],[0.72157,1,0.83137,0],[0.72549,1,0.82353,0],[0.72941,1,0.81569,0],[0.73333,1,0.80784,0],[0.73725,1,0.8,0],[0.74118,1,0.78824,0],[0.7451,1,0.78039,0],[0.74902,1,0.76863,0],[0.75294,1,0.76078,0],[0.75686,1,0.74902,0],[0.76078,1,0.73725,0],[0.76471,1,0.72941,0],[0.76863,1,0.71765,0],[0.77255,1,0.70588,0],[0.77647,1,0.69804,0],[0.78039,1,0.68627,0],[0.78431,1,0.67843,0],[0.78824,1,0.66667,0],[0.79216,1,0.6549,0],[0.79608,1,0.64314,0],[0.8,1,0.63529,0],[0.80392,1,0.62353,0],[0.80784,1,0.61176,0],[0.81176,1,0.6,0],[0.81569,1,0.58824,0],[0.81961,1,0.57647,0],[0.82353,1,0.56863,0],[0.82745,1,0.55686,0],[0.83137,1,0.5451,0],[0.83529,1,0.53333,0],[0.83922,0.99608,0.50196,0],[0.84314,0.98824,0.47059,0],[0.84706,0.98431,0.43922,0],[0.85098,0.98039,0.41176,0],[0.8549,0.97255,0.38039,0],[0.85882,0.96863,0.34902,0],[0.86275,0.96471,0.31765,0],[0.86667,0.96078,0.28627,0],[0.87059,0.95294,0.2549,0],[0.87451,0.94902,0.22745,0],[0.87843,0.9451,0.19608,0],[0.88235,0.93725,0.16471,0],[0.88627,0.93333,0.13333,0],[0.8902,0.93725,0.12157,0],[0.89412,0.9451,0.1098,0],[0.89804,0.94902,0.10196,0],[0.90196,0.95686,0.090196,0],[0.90588,0.96078,0.078431,0],[0.9098,0.96863,0.066667,0],[0.91373,0.97255,0.054902,0],[0.91765,0.97647,0.043137,0],[0.92157,0.98431,0.035294,0],[0.92549,0.98824,0.023529,0],[0.92941,0.99608,0.011765,0],[0.93333,1,0,0],[0.93725,1,0,0],[0.94118,1,0,0],[0.9451,1,0,0],[0.94902,1,0,0],[0.95294,1,0,0],[0.95686,1,0,0],[0.96078,1,0,0],[0.96471,1,0,0],[0.96863,1,0,0],[0.97255,1,0,0],[0.97647,1,0,0],[0.98039,1,0,0],[0.98431,1,0,0],[0.98824,1,0,0],[0.99216,1,0,0],[0.99608,1,0,0],[1,1,0,0]], "gradation": true};
papaya.viewer.ColorTable.TABLE_RED2YELLOW = {"name": "Overlay (Positives)", "data": [[0, 1, 0, 0], [1, 1, 1, 0]],
    "gradation": true};
papaya.viewer.ColorTable.TABLE_BLUE2GREEN = {"name": "Overlay (Negatives)", "data": [[0, 0, 0, 1], [1, 0, 1, 0]],
    "gradation": true};
papaya.viewer.ColorTable.TABLE_HOTANDCOLD = {"name": "Hot-and-Cold", "data": [[0, 0, 0, 1], [0.15, 0, 1, 1],
    [0.3, 0, 1, 0], [0.45, 0, 0, 0], [0.5, 0, 0, 0], [0.55, 0, 0, 0], [0.7, 1, 1, 0], [0.85, 1, 0, 0], [1, 1, 1, 1]],
    "gradation": true};
papaya.viewer.ColorTable.TABLE_GOLD = {"name": "Gold", "data": [[0, 0, 0, 0], [0.13, 0.19, 0.03, 0],
    [0.25, 0.39, 0.12, 0], [0.38, 0.59, 0.26, 0], [0.50, 0.80, 0.46, 0.08], [0.63, 0.99, 0.71, 0.21],
    [0.75, 0.99, 0.88, 0.34], [0.88, 0.99, 0.99, 0.48], [1, 0.90, 0.95, 0.61]], "gradation": true};
papaya.viewer.ColorTable.TABLE_RED2WHITE = {"name": "Red Overlay", "data": [[0, 0.75, 0, 0], [0.5, 1, 0.5, 0],
    [0.95, 1, 1, 0], [1, 1, 1, 1]], "gradation": true};
papaya.viewer.ColorTable.TABLE_GREEN2WHITE = {"name": "Green Overlay", "data": [[0, 0, 0.75, 0], [0.5, 0.5, 1, 0],
    [0.95, 1, 1, 0], [1, 1, 1, 1]], "gradation": true};
papaya.viewer.ColorTable.TABLE_BLUE2WHITE = {"name": "Blue Overlay", "data": [[0, 0, 0, 1], [0.5, 0, 0.5, 1],
    [0.95, 0, 1, 1], [1, 1, 1, 1]], "gradation": true};
papaya.viewer.ColorTable.TABLE_DTI_SPECTRUM = {"name": "Spectrum", "data": [[0, 1, 0, 0], [0.5, 0, 1, 0], [1, 0, 0, 1]],
    "gradation": true};
papaya.viewer.ColorTable.TABLE_FIRE = {"name": "Fire", "data": [[0, 0, 0, 0], [0.06, 0, 0, 0.36], [0.16, 0.29, 0, 0.75],
    [0.22, 0.48, 0, 0.89], [0.31, 0.68, 0, 0.6], [0.37, 0.76, 0, 0.36], [0.5, 0.94, 0.31, 0], [0.56, 1, 0.45, 0],
    [0.81, 1, 0.91, 0], [0.88, 1, 1, 0.38], [1,1,1,1]], "gradation": true};
    

papaya.viewer.ColorTable.ARROW_ICON = "data:image/gif;base64,R0lGODlhCwARAPfGMf//////zP//mf//Zv//M///AP/M///MzP/Mmf/M" +
    "Zv/MM//MAP+Z//+ZzP+Zmf+ZZv+ZM/+ZAP9m//9mzP9mmf9mZv9mM/9mAP8z//8zzP8zmf8zZv8zM/8zAP8A//8AzP8Amf8AZv8AM/8AAMz//8z/" +
    "zMz/mcz/Zsz/M8z/AMzM/8zMzMzMmczMZszMM8zMAMyZ/8yZzMyZmcyZZsyZM8yZAMxm/8xmzMxmmcxmZsxmM8xmAMwz/8wzzMwzmcwzZswzM8wz" +
    "AMwA/8wAzMwAmcwAZswAM8wAAJn//5n/zJn/mZn/Zpn/M5n/AJnM/5nMzJnMmZnMZpnMM5nMAJmZ/5mZzJmZmZmZZpmZM5mZAJlm/5lmzJlmmZlm" +
    "ZplmM5lmAJkz/5kzzJkzmZkzZpkzM5kzAJkA/5kAzJkAmZkAZpkAM5kAAGb//2b/zGb/mWb/Zmb/M2b/AGbM/2bMzGbMmWbMZmbMM2bMAGaZ/2aZ" +
    "zGaZmWaZZmaZM2aZAGZm/2ZmzGZmmWZmZmZmM2ZmAGYz/2YzzGYzmWYzZmYzM2YzAGYA/2YAzGYAmWYAZmYAM2YAADP//zP/zDP/mTP/ZjP/MzP/" +
    "ADPM/zPMzDPMmTPMZjPMMzPMADOZ/zOZzDOZmTOZZjOZMzOZADNm/zNmzDNmmTNmZjNmMzNmADMz/zMzzDMzmTMzZjMzMzMzADMA/zMAzDMAmTMA" +
    "ZjMAMzMAAAD//wD/zAD/mQD/ZgD/MwD/AADM/wDMzADMmQDMZgDMMwDMAACZ/wCZzACZmQCZZgCZMwCZAABm/wBmzABmmQBmZgBmMwBmAAAz/wAz" +
    "zAAzmQAzZgAzMwAzAAAA/wAAzAAAmQAAZgAAM+4AAN0AALsAAKoAAIgAAHcAAFUAAEQAACIAABEAAADuAADdAAC7AACqAACIAAB3AABVAABEAAAi" +
    "AAARAAAA7gAA3QAAuwAAqgAAiAAAdwAAVQAARAAAIgAAEe7u7t3d3bu7u6qqqoiIiHd3d1VVVURERCIiIhEREQAAACH5BAEAAMYALAAAAAALABEA" +
    "AAg/AI0JFGhvoEGC+vodRKgv4UF7DSMqZBixoUKIFSv2w5jRIseOGztK/JgxpMiEJDWmHHkSZUuTIvvt60ezps2AADs=";
papaya.viewer.ColorTable.ARROW_ICON_WIDTH = 11;

papaya.viewer.ColorTable.DEFAULT_COLOR_TABLE = papaya.viewer.ColorTable.TABLE_GRAYSCALE;

papaya.viewer.ColorTable.PARAMETRIC_COLOR_TABLES = [papaya.viewer.ColorTable.TABLE_RED2YELLOW,
    papaya.viewer.ColorTable.TABLE_BLUE2GREEN];

papaya.viewer.ColorTable.OVERLAY_COLOR_TABLES = [
    papaya.viewer.ColorTable.TABLE_RED2WHITE,
    papaya.viewer.ColorTable.TABLE_GREEN2WHITE,
    papaya.viewer.ColorTable.TABLE_BLUE2WHITE
];

papaya.viewer.ColorTable.TABLE_ALL = [
    papaya.viewer.ColorTable.TABLE_GRAYSCALE,
    papaya.viewer.ColorTable.TABLE_SPECTRUM,
	papaya.viewer.ColorTable.TABLE_AAASMO,
    papaya.viewer.ColorTable.TABLE_FIRE,
    papaya.viewer.ColorTable.TABLE_HOTANDCOLD,
    papaya.viewer.ColorTable.TABLE_GOLD,
    papaya.viewer.ColorTable.TABLE_RED2YELLOW,
    papaya.viewer.ColorTable.TABLE_BLUE2GREEN,
    papaya.viewer.ColorTable.TABLE_RED2WHITE,
    papaya.viewer.ColorTable.TABLE_GREEN2WHITE,
    papaya.viewer.ColorTable.TABLE_BLUE2WHITE
];

papaya.viewer.ColorTable.LUT_MIN = 0;
papaya.viewer.ColorTable.LUT_MAX = 255;
papaya.viewer.ColorTable.ICON_SIZE = 18;
papaya.viewer.ColorTable.COLOR_BAR_WIDTH = 100;
papaya.viewer.ColorTable.COLOR_BAR_HEIGHT = 15;


/*** Static Methods ***/

papaya.viewer.ColorTable.findLUT = function (name) {
    var ctr;

    for (ctr = 0; ctr < papaya.viewer.ColorTable.TABLE_ALL.length; ctr += 1) {
        if (papaya.viewer.ColorTable.TABLE_ALL[ctr].name == name) {  // needs to be ==, not ===
            return papaya.viewer.ColorTable.TABLE_ALL[ctr];
        }
    }

    return papaya.viewer.ColorTable.TABLE_GRAYSCALE;
};



papaya.viewer.ColorTable.addCustomLUT = function (lut) {
    if (papaya.viewer.ColorTable.findLUT(lut.name).data === papaya.viewer.ColorTable.TABLE_GRAYSCALE.data) {
        papaya.viewer.ColorTable.TABLE_ALL.push(lut);
    }
};


/*** Prototype Methods ***/

papaya.viewer.ColorTable.prototype.updateMinLUT = function (minLUTnew) {
    this.updateLUT(minLUTnew, this.maxLUT);
};



papaya.viewer.ColorTable.prototype.updateMaxLUT = function (maxLUTnew) {
    this.updateLUT(this.minLUT, maxLUTnew);
};



papaya.viewer.ColorTable.prototype.updateLUT = function (minLUTnew, maxLUTnew) {
    var range, ctr, ctrKnot, value;

    this.maxLUT = maxLUTnew;
    this.minLUT = minLUTnew;
    range = this.maxLUT - this.minLUT;

    for (ctr = 0; ctr < this.lutData.length; ctr += 1) {
        this.knotThresholds[ctr] = (this.lutData[ctr][0] * range) + this.minLUT;
    }

    for (ctr = 0; ctr < (this.lutData.length - 1); ctr += 1) {
        this.knotRangeRatios[ctr] = papaya.viewer.ColorTable.LUT_MAX / (this.knotThresholds[ctr + 1] -
            this.knotThresholds[ctr]);
    }

    for (ctr = 0; ctr < 256; ctr += 1) {
        if (ctr <= this.minLUT) {
            this.LUTarrayR[ctr] = this.knotMin[1] * papaya.viewer.ColorTable.LUT_MAX;
            this.LUTarrayG[ctr] = this.knotMin[2] * papaya.viewer.ColorTable.LUT_MAX;
            this.LUTarrayB[ctr] = this.knotMin[3] * papaya.viewer.ColorTable.LUT_MAX;
        } else if (ctr > this.maxLUT) {
            this.LUTarrayR[ctr] = this.knotMax[1] * papaya.viewer.ColorTable.LUT_MAX;
            this.LUTarrayG[ctr] = this.knotMax[2] * papaya.viewer.ColorTable.LUT_MAX;
            this.LUTarrayB[ctr] = this.knotMax[3] * papaya.viewer.ColorTable.LUT_MAX;
        } else {
            for (ctrKnot = 0; ctrKnot < (this.lutData.length - 1); ctrKnot += 1) {
                if ((ctr > this.knotThresholds[ctrKnot]) && (ctr <= this.knotThresholds[ctrKnot + 1])) {
                    if (this.useGradation) {
                        value = (((ctr - this.knotThresholds[ctrKnot]) * this.knotRangeRatios[ctrKnot]) + 0.5) /
                            papaya.viewer.ColorTable.LUT_MAX;

                        this.LUTarrayR[ctr] = (((1 - value) * this.lutData[ctrKnot][1]) +
                            (value * this.lutData[ctrKnot + 1][1])) * papaya.viewer.ColorTable.LUT_MAX;
                        this.LUTarrayG[ctr] = (((1 - value) * this.lutData[ctrKnot][2]) +
                            (value * this.lutData[ctrKnot + 1][2])) * papaya.viewer.ColorTable.LUT_MAX;
                        this.LUTarrayB[ctr] = (((1 - value) * this.lutData[ctrKnot][3]) +
                            (value * this.lutData[ctrKnot + 1][3])) * papaya.viewer.ColorTable.LUT_MAX;
                    } else {
                        this.LUTarrayR[ctr] = (this.lutData[ctrKnot][1]) * papaya.viewer.ColorTable.LUT_MAX;
                        this.LUTarrayG[ctr] = (this.lutData[ctrKnot][2]) * papaya.viewer.ColorTable.LUT_MAX;
                        this.LUTarrayB[ctr] = (this.lutData[ctrKnot][3]) * papaya.viewer.ColorTable.LUT_MAX;
                    }
                }
            }
        }
    }
};



papaya.viewer.ColorTable.prototype.lookupRed = function (index) {
    /*jslint bitwise: true */

    if ((index >= 0) && (index < 256)) {
        return (this.LUTarrayR[index] & 0xff);
    }

    return 0;
};



papaya.viewer.ColorTable.prototype.lookupGreen = function (index) {
    /*jslint bitwise: true */

    if ((index >= 0) && (index < 256)) {
        return (this.LUTarrayG[index] & 0xff);
    }

    return 0;
};



papaya.viewer.ColorTable.prototype.lookupBlue = function (index) {
    /*jslint bitwise: true */

    if ((index >= 0) && (index < 256)) {
        return (this.LUTarrayB[index] & 0xff);
    }

    return 0;
};
