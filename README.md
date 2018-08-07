<h1 align="center">
    <a href="https://github.com/vazco">vazco</a>/Universe Selectize
</h1>

<p align="center">
    <img src="https://img.shields.io/david/peer/vazco/eslint-config-vazco.svg" alt="peerDependencies">
    <img src="https://img.shields.io/david/dev/vazco/eslint-config-vazco.svg" alt="devDependencies">
    <a href="https://vazco.eu">
        <img src="https://img.shields.io/badge/vazco-package-blue.svg?logo=data%3Aimage%2Fpng%3Bbase64%2CiVBORw0KGgoAAAANSUhEUgAAAA4AAAAOCAYAAAAfSC3RAAAABmJLR0QA%2FwD%2FAP%2BgvaeTAAAACXBIWXMAAAsTAAALEwEAmpwYAAAAB3RJTUUH4QMfFAIRHb8WQgAAAY1JREFUKM%2BNkLFrGgEUxr87FMnpnXdIqxi1Q3VxachgSbcOgRBCTMbgH9CCW%2BjSUminSpEmBEIpHW7rkCmQSSjEKVOGEAK5bOFyk4c5TMRTyZ1fl5aK9ai%2F8b334%2Ft4QBBmLQmz9jpoLSKYPQCfYdaezi6atTKAMoAYgK1pJ8LkQPr5JspHsbO%2BFilAEADQArCA3Ftn%2FC40KebPO4Ln37peNNxrFxPSXTaW9cPiewDbgYkkXwBYB3B5dHES3W8cpM254ctOJhr3wsKqs7Zj%2FdOZZITkMf9yT%2FKq3e18eHf47fmTT5XE1H%2BQ3GAwDyQ%2FkkxMSvLvhP%2FxZVLc42zYJBf%2FSPMkW57nsd%2Fv03VdDgYDjkajIPkryVDIdd1Xtm0%2Fdhznptvtmr7vu5IkRRRFySiKko%2FH45BlebzgJoBdodls%2FjAM49SyrIau69etVmsIIFStVnPFYvFZoVBY1jRtJZlMpjRNm5MkCaIofhfq9XrMMIyeruuc9u1KpRIulUqqqqpLqqqW0%2Bl0OZVKyb8ANqUwunhV3dcAAAAASUVORK5CYII%3D&style=flat-square">
    </a>
</p>

&nbsp;

<a href="http://vazco.eu" target="_blank"><img src="https://vazco.eu/universe-banner.png" /></a>

&nbsp;

> This package is part of Universe, a framework based on [Meteor platform](http://meteor.com)
maintained by [Vazco](http://www.vazco.eu).

> It works standalone, but you can get max out of it when using the whole system.

## Demo
http://universe-autoform-select.stg.vazco.eu/

https://github.com/vazco/meteor-universe-selectize-demo.git


## Installation

In a Meteor app directory, enter:

```bash
$ meteor add vazco:universe-selectize
```

## Usage

```js
{{> universeSelectize name="test1" options=options multiple=false create=true}}

{{> universeSelectize name="test2" options=options multiple=true create=true remove=true}}
```

## Options

<table width="100%">
	<tr>
		<th valign="top" colspan="4" align="left"><a href="#general" name="general">universe-selectize options</a></th>
	</tr>
	<tr>
		<th valign="top" width="120px" align="left">Option</th>
		<th valign="top" align="left">Description</th>
		<th valign="top" width="60px" align="left">Type</th>
		<th valign="top" width="60px" align="left">Default</th>
	</tr>
	<tr>
		<td valign="top"><code>options</code></td>
		<td valign="top"><i>Required.</i> A function returning either an array of options, or a <code>Mongo.Cursor</code>. The function is re-evaluated automatically using <code>Tracker</code> when its reactive data sources change.</td>
		<td valign="top"><code>function</code></td>
		<td valign="top"><code>undefined</code></td>
	</tr>
	<tr>
        <td valign="top"><code>placeholder</code></td>
        <td valign="top"><i>Optional.</i> A placeholder option.</td>
        <td valign="top"><code>String</code></td>
        <td valign="top"><code>null</code></td>
    </tr>
    <tr>
        <td valign="top"><code>optionsPlaceholder</code></td>
        <td valign="top"><i>Optional.</i> Show placeholder in options dropdown.</td>
        <td valign="top"><code>Boolean or String</code></td>
        <td valign="top"><code>false</code></td>
    </tr>
	<tr>
        <td valign="top"><code>disabled</code></td>
        <td valign="top"><i>Optional.</i></td>
        <td valign="top"><code>Boolean</code></td>
        <td valign="top"><code>false</code></td>
    </tr>
	<tr>
		<td valign="top"><code>multiple</code></td>
		<td valign="top"><i>Optional.</i> </td>
		<td valign="top"><code>Boolean</code></td>
		<td valign="top"><code>false</code></td>
	</tr>
	<tr>
        <td valign="top"><code>removeButton</code></td>
        <td valign="top"><i>Optional.</i> </td>
        <td valign="top"><code>Boolean</code></td>
        <td valign="top"><code>true</code></td>
    </tr>
    <tr>
        <td valign="top"><code>create</code></td>
        <td valign="top"><i>Optional. Allows the user to create a new items that aren't in the list of options.</i> </td>
        <td valign="top"><code>Boolean</code></td>
        <td valign="top"><code>true</code></td>
    </tr>
    <tr>
        <td valign="top"><code>createText</code></td>
        <td valign="top"><i>Optional. Allows the user to change the create text.</i> </td>
        <td valign="top"><code>String</code></td>
        <td valign="top"><code>undefined</code></td>
    </tr>
    <tr>
        <td valign="top"><code>createMethod</code></td>
        <td valign="top"><i>Optional. Name of method to call after create new item. Method can return new value for item.</i> </td>
        <td valign="top"><code>String</code></td>
        <td valign="top"><code>undefined</code></td>
    </tr>
    <tr>
        <td valign="top"><code>optionsMethod</code></td>
        <td valign="top"><i>Optional. Name of method to get more items. Method should return array of options.</i> </td>
        <td valign="top"><code>String</code></td>
        <td valign="top"><code>undefined</code></td>
    </tr>
    <tr>
        <td valign="top"><code>optionsMethodParams</code></td>
        <td valign="top"><i>Optional. Additional params for optionsMethod.</i> </td>
        <td valign="top"><code>Object</code></td>
        <td valign="top"><code>undefined</code></td>
    </tr>
    <tr>
        <td valign="top"><code>sortMethod</code></td>
        <td valign="top"><i>Optional.</i> </td>
        <td valign="top"><code>Function</code></td>
        <td valign="top"><code>'label'</code></td>
    </tr>
</table>

## License

<img src="https://vazco.eu/banner.png" align="right">

**Like every package maintained by [Vazco](https://vazco.eu/), Universe Selectize is [MIT licensed](https://github.com/vazco/uniforms/blob/master/LICENSE).**
